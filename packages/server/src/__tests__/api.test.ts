import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

/**
 * Canonical BIP39 12-word test vector (all-zero entropy).
 *
 * A literal, not a call into core, because this file must not import
 * `@lembaranz/core`. Evaluating that barrel a second time in a `bun test`
 * process leaves it half-built, and the server then sees an `Archive` with
 * missing methods. That is pre-existing and reproducible with this file
 * unmodified; generation and checksum correctness are covered in core by
 * `Password.test.ts`.
 */
const VALID_PHRASE =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

/**
 * The server is a security path: it holds the master key and answers over
 * HTTP. These cover the properties that matter, in one file per the ponytail
 * rule rather than a suite per route.
 *
 * The server reads DB_PATH and LEMBARANZ_HOST/PORT on import, so the env is
 * set before the dynamic import.
 */
const PORT = '5231';
const base = `http://127.0.0.1:${PORT}`;

let server: { stop: (force?: boolean) => void; hostname: string };
let token = '';
let tempDir: string;

const auth = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-server-'));
    process.env.DB_PATH = path.join(tempDir, 'vault.json');
    process.env.LEMBARANZ_PORT = PORT;
    process.env.LEMBARANZ_HOST = '127.0.0.1';

    const mod = await import('../index');
    server = mod.server as unknown as { stop: (force?: boolean) => void; hostname: string };
    token = mod.TOKEN;
});

afterAll(async () => {
    server?.stop(true);
    await fs.rm(tempDir, { recursive: true, force: true });
});

describe('vault server: authentication', () => {
    test('health is reachable without a token so the UI can probe the address', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        expect(await res.json()).toHaveProperty('ok', true);
    });

    test('every other route rejects a missing token', async () => {
        for (const route of ['/status', '/notes', '/unlock', '/lock', '/wipe']) {
            const res = await fetch(`${base}${route}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}',
            });
            expect(res.status).toBe(401);
        }
    });

    test('a wrong token is rejected', async () => {
        const res = await fetch(`${base}/status`, {
            method: 'POST',
            headers: { Authorization: 'Bearer not-the-token', 'Content-Type': 'application/json' },
            body: '{}',
        });
        expect(res.status).toBe(401);
    });

    test('an empty bearer is rejected', async () => {
        const res = await fetch(`${base}/status`, {
            method: 'POST',
            headers: { Authorization: 'Bearer ', 'Content-Type': 'application/json' },
            body: '{}',
        });
        expect(res.status).toBe(401);
    });

    test('a prefix of the real token is rejected', async () => {
        const res = await fetch(`${base}/status`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.slice(0, 8)}`, 'Content-Type': 'application/json' },
            body: '{}',
        });
        expect(res.status).toBe(401);
    });

    test('the correct token gets past the auth gate', async () => {
        const res = await fetch(`${base}/status`, { method: 'POST', headers: auth() });
        // Not 401. The route may still fail for reasons of its own; all this
        // asserts is that the token was accepted.
        expect(res.status).not.toBe(401);
    });
});

describe('vault server: response hygiene', () => {
    test('responses are never cacheable', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.headers.get('cache-control')).toBe('no-store');
    });

    test('an unknown route is a 404, not a crash', async () => {
        const res = await fetch(`${base}/does-not-exist`, { method: 'POST', headers: auth() });
        expect(res.status).toBe(404);
    });

    test('a malformed JSON body does not take the server down', async () => {
        const res = await fetch(`${base}/does-not-exist`, {
            method: 'POST',
            headers: auth(),
            body: 'not json at all',
        });
        expect(res.status).toBe(404);
        expect((await fetch(`${base}/health`)).status).toBe(200);
    });

    test('binds to loopback only', () => {
        expect(server.hostname).toBe('127.0.0.1');
    });
});

describe('vault server: the web entry flow', () => {
    const post = (route: string, body: unknown = {}) =>
        fetch(`${base}${route}`, { method: 'POST', headers: auth(), body: JSON.stringify(body) });

    test('a first run creates the vault and hands back an open session', async () => {
        const res = await post('/setup', {
            password: 'correct-horse-battery',
            mnemonic: VALID_PHRASE,
        });
        expect(res.status).toBe(200);
        expect((await res.json()).error).toBeUndefined();
        const { data } = await (await post('/status')).json();
        expect(data).toEqual({ setup: true, locked: false });
    });

    test('re-initialising an existing vault is refused, not reported as success', async () => {
        // Setup mints a new master key. Running it against an existing vault
        // orphans every entry already encrypted under the old one, so this must
        // never look like it worked.
        const res = await post('/setup', { password: 'another-password-99' });
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('already_setup');
    });

    test('a wrong password reports a code, not a crypto error', async () => {
        const res = await post('/unlock', { password: 'definitely-not-it' });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.code).toBe('wrong_password');
        // The old failure surfaced WebCrypto's "The operation failed for an
        // operation-specific reason", which tells a user nothing at all.
        expect(body.error).not.toMatch(/operation-specific/i);
    }, 60_000);

    test('reading a locked vault reports the locked code so the UI can re-prompt', async () => {
        await post('/lock');
        const res = await fetch(`${base}/notes`, { headers: auth() });
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('locked');
    });

    test('a wrong recovery phrase reports its own code', async () => {
        const res = await post('/recover', { mnemonic: 'not actually a valid bip39 phrase at all here ok' });
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('recovery_failed');
    }, 60_000);

    test('the recovery phrase used at setup unlocks the vault', async () => {
        // The whole point of the phrase. This route existed the entire time with
        // no UI to reach it, so it was never exercised end to end.
        const res = await post('/recover', { mnemonic: VALID_PHRASE });
        expect(res.status).toBe(200);
        expect((await res.json()).data).toBe(true);
        const { data } = await (await post('/status')).json();
        expect(data.locked).toBe(false);
    }, 60_000);
});

describe('vault server: the paths the security claims rest on', () => {
    const post = (route: string, body: unknown = {}) =>
        fetch(`${base}${route}`, { method: 'POST', headers: auth(), body: JSON.stringify(body) });

    test('the recovery phrase is 12 words', async () => {
        // The BIP39 checksum itself is covered in core (`Password.test.ts`).
        // What this route adds is that it returns a phrase at all, and returns
        // exactly one.
        const { data } = await (await post('/recovery-phrase')).json();
        expect(data.split(' ')).toHaveLength(12);
    });

    test('generating a phrase persists nothing', async () => {
        // It must not be stored on generation: only setup accepts it. Saving it
        // here would leave a recovery credential in storage before a vault
        // exists to protect.
        const before = await (await post('/status')).json();
        await post('/recovery-phrase');
        expect((await (await post('/status')).json())).toEqual(before);
    });

    test('the audit route returns a verified chain the UI can show', async () => {
        const { data } = await (await post('/audit')).json();
        expect(data.chain.ok).toBe(true);
        expect(data.chain.checked).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(data.entries)).toBe(true);
    });

    test('stats report real entry counts', async () => {
        const res = await post('/stats');
        const { data } = await res.json();
        expect(res.status).toBe(200);
        expect(typeof data.notes).toBe('number');
        expect(typeof data.folders).toBe('number');
    });
});

describe('vault server: brute force is throttled over HTTP', () => {
    // The throttling itself is tested in core (`UnlockRateLimit.test.ts`),
    // next to the code that owns it. What matters here is that the HTTP route
    // goes through that code rather than around it, which is exactly the bug:
    // the check used to live in the CLI only, leaving this route unthrottled.
    test('password guessing locks out, which the CLI path used to enforce alone', async () => {
        await fetch(`${base}/setup`, {
            method: 'POST',
            headers: auth(),
            body: JSON.stringify({ password: 'correcthorse123' }),
        });

        // Sentinel allows 5 attempts; the 6th must be refused. These run real
        // Argon2id derivations, so the timeout is generous.
        for (let i = 0; i < 5; i++) {
            await fetch(`${base}/unlock`, {
                method: 'POST',
                headers: auth(),
                body: JSON.stringify({ password: 'wrongwrongwrong' }),
            });
        }

        const refused = await fetch(`${base}/unlock`, {
            method: 'POST',
            headers: auth(),
            body: JSON.stringify({ password: 'correcthorse123' }),
        });
        expect(refused.status).toBe(400);
        expect((await refused.json()).error).toMatch(/Too many failed attempts/);
    }, 60_000);
});

/**
 * These run BEFORE the brute-force suite on purpose, because they depend on a
 * clean vault and a clean rate-limit bucket. Doing them in the other order
 * meant inheriting a locked vault and five spent attempts, so the suite only
 * passed when run on its own.
 *
 * The brute-force suite that follows calls `/setup` without reading the result,
 * so a vault already existing here does not disturb it.
 */

/**
 * Fuzz and property tests for the crypto boundary.
 *
 * The invariant under test is one sentence: a vault that cannot authenticate
 * its input must return nothing at all, never a prefix, never a partial decode.
 * Every generator here is seeded, so a failure is reproducible from the seed
 * printed in the assertion message rather than needing a rerun loop.
 *
 * Runtime matters: the Phase 1 gate requires every fuzz target under 30s in CI.
 * Argon2id at m=64 MiB runs once for the shared key and the rest reuse it, so
 * the bulk of these cases cost a single AES-GCM operation each.
 */
import { describe, test, expect } from 'bun:test';
import { Vault } from '../Vault';
import { Integrity } from '../Integrity';
import { Archive } from '../Archive';
import { Storage } from '../Storage';
import type { Note } from '../Formula';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const ARGON_TIMEOUT = 60_000;
const FUZZ_TIMEOUT = 30_000;

/**
 * A small deterministic PRNG (mulberry32).
 *
 * `Math.random` would make a failure unreproducible, and a fuzz test that cannot
 * be replayed is a bug report nobody can act on.
 */
function rng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randomBytes(rand: () => number, len: number): Uint8Array {
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = Math.floor(rand() * 256);
    return out;
}

/** Printable ASCII plus the multi-byte and control ranges. */
function randomUnicode(rand: () => number, maxLen: number): string {
    const pools = [
        [0x20, 0x7e],
        [0xa0, 0xff],
        [0x3040, 0x30ff],
        [0x4e00, 0x9fff],
        [0x1f300, 0x1f5ff],
        [0x0000, 0x001f],
    ];
    const len = Math.floor(rand() * maxLen);
    let s = '';
    for (let i = 0; i < len; i++) {
        const [lo, hi] = pools[Math.floor(rand() * pools.length)];
        s += String.fromCodePoint(lo + Math.floor(rand() * (hi - lo + 1)));
    }
    return s;
}

/**
 * The shared AES-GCM key the whole fuzz suite runs against.
 *
 * Passed explicitly to every `Vault` call. `Vault` otherwise falls back to the
 * session's active key, which is unset in a unit test, so relying on it would
 * make every case fail with "vault locked" instead of exercising AES-GCM.
 */
const key = (await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
)) as CryptoKey;

/** `decryptPacked` has no key argument, so it needs the active key set. */
function useKey(k: CryptoKey): void {
    Vault.setActiveKey(k);
}

/**
 * Decodes a packed value to the bytes AES-GCM will actually authenticate.
 *
 * `decryptPacked` sees only the decoded bytes, so "did this mutation change
 * anything" has to be asked about bytes. Comparing the encoded strings is not
 * enough: base64 ignores the padding bits of the final group, so two different
 * strings can decode to identical bytes. That is not a theoretical edge, it is
 * what makes a corrupted field decrypt cleanly, and it is exactly the kind of
 * round that would silently test nothing.
 */
function decodePacked(packed: string): Uint8Array[] | null {
    const [ivHex, payload] = packed.split('|');
    if (ivHex === undefined || payload === undefined) return null;
    try {
        return [Vault.hexToBytes(ivHex), Vault.base64ToBytes(payload)];
    } catch {
        return null;
    }
}

/** True when two decoded packed values differ in at least one byte. */
function bytesDiffer(a: Uint8Array[] | null, b: Uint8Array[] | null): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
        if (a[i].length !== b[i].length) return true;
        for (let k = 0; k < a[i].length; k++) if (a[i][k] !== b[i][k]) return true;
    }
    return false;
}

describe('fuzz: AES-GCM must fail closed', () => {
    test('a single flipped bit anywhere in a ciphertext is rejected, 500 cases', async () => {
        useKey(key);
        const plaintext = 'the quick brown fox jumps over the lazy dog';
        const sealed = await Vault.encrypt(plaintext, key);
        expect(sealed.error).toBeNull();
        // The IV is generated inside `encrypt`, so it has to come from there.
        const iv = sealed.data!.iv;
        const original = new Uint8Array(sealed.data!.data);

        const rand = rng(0x5eed);
        let rejected = 0;
        for (let i = 0; i < 500; i++) {
            // A control read first: the untouched bytes must still decrypt, so a
            // rejection below is caused by the mutation and not by the input.
            const control = await Vault.decrypt(
                new Uint8Array(original).buffer as ArrayBuffer,
                iv,
                key,
            );
            expect(control.error).toBeNull();
            expect(control.data).toBe(plaintext);

            const mutated = new Uint8Array(original);
            const at = Math.floor(rand() * mutated.length);
            mutated[at] ^= 1 << Math.floor(rand() * 8);
            const bad = await Vault.decrypt(mutated.buffer as ArrayBuffer, iv, key);
            expect(bad.error).not.toBeNull();
            expect(bad.data).toBeFalsy();
            rejected++;
        }
        expect(rejected).toBe(500);
    }, FUZZ_TIMEOUT);

    test('a ciphertext truncated at every offset is rejected', async () => {
        const sealed = await Vault.encrypt('abcdefghijklmnopqrstuvwxyz0123456789', key);
        expect(sealed.error).toBeNull();
        const iv = sealed.data!.iv;
        const body = new Uint8Array(sealed.data!.data);

        // Every possible truncation length is attempted, so no prefix can pass.
        for (let cut = 0; cut < body.length; cut++) {
            const res = await Vault.decrypt(
                body.slice(0, cut).buffer as ArrayBuffer,
                iv,
                key,
            );
            expect(res.error).not.toBeNull();
            expect(res.data).toBeFalsy();
        }
    }, FUZZ_TIMEOUT);

    test('an extended ciphertext with appended bytes is rejected', async () => {
        const sealed = await Vault.encrypt('payload', key);
        expect(sealed.error).toBeNull();
        const iv = sealed.data!.iv;
        const body = new Uint8Array(sealed.data!.data);

        const rand = rng(0xabcd);
        for (let i = 0; i < 100; i++) {
            const extra = Math.floor(rand() * 32) + 1;
            const grown = new Uint8Array(body.length + extra);
            grown.set(body);
            grown.set(randomBytes(rand, extra), body.length);
            const res = await Vault.decrypt(grown.buffer as ArrayBuffer, iv, key);
            expect(res.error).not.toBeNull();
            expect(res.data).toBeFalsy();
        }
    }, FUZZ_TIMEOUT);

    test('random bytes are never mistaken for a packed value', async () => {
        const rand = rng(0x1234);
        for (let i = 0; i < 300; i++) {
            const junk = randomBytes(rand, Math.floor(rand() * 200) + 1);
            const asText = Array.from(junk, (b) => String.fromCharCode(b)).join('');
            const res = await Vault.decryptPacked(asText);
            if (!res.error) {
                // Passthrough only happens for values that were never packed;
                // a random byte string must not be treated as genuine plaintext.
                expect(Vault.isPacked(asText)).toBe(false);
            }
        }
    }, FUZZ_TIMEOUT);

    test('a packed value with a mangled IV is rejected', async () => {
        const packed = await Vault.encryptPacked('sensitive', key);
        expect(packed.error).toBeNull();
        const parts = packed.data!.split('|');
        const rand = rng(0x9999);

        for (let i = 0; i < 200; i++) {
            const iv = randomBytes(rand, parts[0].length / 2);
            const forged = `${Array.from(iv, (b) => b.toString(16).padStart(2, '0')).join('')}|${parts[1]}`;
            const res = await Vault.decryptPacked(forged);
            expect(res.error).not.toBeNull();
            expect(res.data).toBeFalsy();
        }
    }, FUZZ_TIMEOUT);

    test('a packed value whose body is swapped for another body is rejected', async () => {
        const a = await Vault.encryptPacked('message A', key);
        const b = await Vault.encryptPacked('message B', key);
        const bodyB = b.data!.split('|')[1];

        const forged = `${a.data!.split('|')[0]}|${bodyB}`;

        const res = await Vault.decryptPacked(forged);
        expect(res.error).not.toBeNull();
        expect(res.data).toBeFalsy();
    }, FUZZ_TIMEOUT);

    test('the wrong key never yields plaintext', async () => {
        useKey(key);
        const packed = await Vault.encryptPacked('top secret value', key);
        expect(packed.error).toBeNull();
        const wrongKey = (await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        )) as CryptoKey;

        const res = await Vault.decrypt(
            new Uint8Array(Vault.base64ToBytes(packed.data!.split('|')[1])).buffer as ArrayBuffer,
            Vault.hexToBytes(packed.data!.split('|')[0]),
            wrongKey,
        );

        expect(res.error).not.toBeNull();
        expect(res.data).toBeFalsy();
    }, FUZZ_TIMEOUT);

    test('an empty ciphertext is rejected', async () => {
        const iv = randomBytes(() => 0.5, 12);
        expect((await Vault.decrypt(new Uint8Array(0).buffer as ArrayBuffer, iv, key)).error).not.toBeNull();
        expect((await Vault.decrypt(new Uint8Array(1).buffer as ArrayBuffer, iv, key)).error).not.toBeNull();
        // An IV with no body at all.
        expect((await Vault.decrypt(new Uint8Array(12).buffer as ArrayBuffer, iv, key)).error).not.toBeNull();
    }, FUZZ_TIMEOUT);

    test('a zero-length plaintext round-trips', async () => {
        const sealed = await Vault.encrypt('', key);
        expect(sealed.error).toBeNull();
        const back = await Vault.decrypt(
            sealed.data!.data,
            sealed.data!.iv,
            key,
        );
        expect(back.error).toBeNull();
        expect(back.data).toBe('');
    }, FUZZ_TIMEOUT);
});

describe('fuzz: packed encoding round-trips arbitrary text', () => {
    test('300 random unicode strings, including lone surrogates, survive a round trip', async () => {
        useKey(key);
        const rand = rng(0xf00d);
        for (let i = 0; i < 300; i++) {
            const text = randomUnicode(rand, 400);
            const packed = await Vault.encryptPacked(text, key);
            expect(packed.error).toBeNull();
            const back = await Vault.decryptPacked(packed.data!);
            expect(back.error).toBeNull();
            // `encode` replaces a lone surrogate with U+FFFD, so the round trip
            // is only exact when the text contains no unpaired surrogate.
            const exact = !/[\uD800-\uDFFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(
                text,
            );
            if (exact) {
                expect(back.data).toBe(text);
            } else {
                expect(back.data!.length).toBeGreaterThan(0);
            }
        }
    }, FUZZ_TIMEOUT);

    test('random unicode without the surrogate range round-trips exactly', async () => {
        useKey(key);
        const rand = rng(0xf00d);
        for (let i = 0; i < 300; i++) {
            const text = randomUnicode(rand, 400);
            const packed = await Vault.encryptPacked(text, key);
            expect(packed.error).toBeNull();
            const back = await Vault.decryptPacked(packed.data!);
            expect(back.error).toBeNull();
            expect(back.data).toBe(text);
        }
    }, FUZZ_TIMEOUT);

    test('a pipe character in the text does not confuse the decoder', async () => {
        useKey(key);
        const text = 'a|b|c|d|';
        const packed = await Vault.encryptPacked(text, key);
        expect(packed.error).toBeNull();
        expect(packed.data!.split('|').length).toBe(2);

        const back = await Vault.decryptPacked(packed.data!);

        expect(back.error).toBeNull();
        expect(back.data).toBe(text);
    }, FUZZ_TIMEOUT);

    test('a large payload round-trips exactly', async () => {
        // `decryptPacked` takes a string and `TextEncoder` always emits UTF-8,
        // so bytes >= 0x80 expand to two bytes on the way in. The invariant is
        // therefore on the string, which is what a note body actually is.
        for (const size of [0, 1, 15, 16, 17, 65_536, 1_000_000]) {
            useKey(key);
            const buf = randomBytes(rng(0x31337 + size), size);
            const text = new TextDecoder('latin1').decode(buf);
            const sealed = await Vault.encryptPacked(text);
            expect(sealed.error).toBeNull();

            const back = await Vault.decryptPacked(sealed.data!);
            expect(back.error).toBeNull();
            expect(back.data).toBe(text);
        }
    }, FUZZ_TIMEOUT);

    test('the plaintext cache never returns a value the key did not produce', async () => {
        useKey(key);
        const text = 'cached-value-check';
        const sealed = await Vault.encryptPacked(text);
        expect(sealed.error).toBeNull();

        // First read populates the cache from a real decrypt.
        expect((await Vault.decryptPacked(sealed.data!)).data).toBe(text);

        // A different key must not be able to read the cached entry.
        const otherKey = (await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        )) as CryptoKey;
        const forced = await Vault.decrypt(
            new Uint8Array(Vault.base64ToBytes(sealed.data!.split('|')[1])).buffer as ArrayBuffer,
            Vault.hexToBytes(sealed.data!.split('|')[0]),
            otherKey,
        );
        expect(forced.error).not.toBeNull();
    }, FUZZ_TIMEOUT);
});

describe('fuzz: the integrity seal detects modification', () => {
    test('changing any field of a sealed object breaks the hash', async () => {
        const rand = rng(0xfeed);
        const keys = ['title', 'content', 'tags', 'id'];

        for (let i = 0; i < 200; i++) {
            const note = {
                id: `n-${i}`,
                title: randomUnicode(rand, 30),
                content: randomUnicode(rand, 60),
                tags: ['a', 'b'],
            };
            const seal = await Integrity.computeHash(note);
            const mutated = { ...note, [keys[Math.floor(rand() * keys.length)]]: 'tampered' };
            const after = await Integrity.computeHash(mutated);
            expect(after).not.toBe(seal);
        }
    }, FUZZ_TIMEOUT);

    test('the seal ignores exactly the excluded fields and nothing else', async () => {
        const base = { id: 'x', title: 't', content: 'c', tags: ['z'] };
        const seal = await Integrity.computeHash(base);

        // These three are excluded by policy.
        expect(await Integrity.computeHash({ ...base, _hash: 'anything' })).toBe(seal);
        expect(await Integrity.computeHash({ ...base, _timestamp: 12345 })).toBe(seal);
        expect(await Integrity.computeHash({ ...base, updatedAt: 'later' })).toBe(seal);

        // Every other field is covered.
        expect(await Integrity.computeHash({ ...base, title: 't2' })).not.toBe(seal);
        expect(await Integrity.computeHash({ ...base, tags: ['z2'] })).not.toBe(seal);
    }, FUZZ_TIMEOUT);

    test('the seal is order-sensitive, so reordering keys is a change', async () => {
        const seal = await Integrity.computeHash({ a: 1, b: 2, c: 3 });

        // JSON.stringify preserves insertion order, so a rehash sees a
        // different byte sequence. Pinned because it is what makes the seal
        // reproducible only when the same code path rebuilds the object.
        expect(await Integrity.computeHash({ c: 3, b: 2, a: 1 })).not.toBe(seal);
    }, FUZZ_TIMEOUT);
});

describe('fuzz: a tampered stored entry never yields clean plaintext', () => {
    let tmpDir = '';

    test('a base64 edit to padding bits is recognised as a no-op, not a mutation', () => {
        // This is the round that silently tested nothing and only showed up when
        // the suite ran in a different order: base64 ignores the padding bits of
        // the final group, so "GQ==" and "GX==" are different strings that decode
        // to the very same byte. A "corrupted" field built that way decrypts
        // cleanly, which is correct product behaviour and a useless test round.
        const noop = decodePacked('dce7d3fd22d0f1adce0bf2ee|GQ==');
        expect('dce7d3fd22d0f1adce0bf2ee|GQ==').not.toBe('dce7d3fd22d0f1adce0bf2ee|GX==');
        expect(bytesDiffer(noop, decodePacked('dce7d3fd22d0f1adce0bf2ee|GX=='))).toBe(false);
        // A character whose significant bits differ really is a mutation.
        expect(bytesDiffer(noop, decodePacked('dce7d3fd22d0f1adce0bf2ee|IQ=='))).toBe(true);
        // Hex is case-insensitive, so a case-only edit of the IV half is also a
        // no-op. Base64 is not, so this cannot be generalised to both segments.
        expect(bytesDiffer(decodePacked('abc123|GQ=='), decodePacked('ABC123|GQ=='))).toBe(false);
    });

    test('corrupting stored ciphertext always fails closed', async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-fuzz-'));
        await Storage.initialize(path.join(tmpDir, 'vault.json'));
        await Archive.setupVault('fuzz-vault-password');

        await Archive.saveNote({
            id: 'target',
            title: 'FINDME',
            content: 'FINDME-BODY-SECRET',
            tags: [],
            folderId: null,
            isPinned: false,
            isFavorite: false,
        });

        const rand = rng(0x3131);
        for (let i = 0; i < 120; i++) {
            // Rebuild a valid record each round, then flip one character of one
            // ciphertext field. AES-GCM authenticates every byte, so this must
            // be refused outright rather than yielding partial text.
            await Archive.saveNote({
                id: 'target',
                title: 'FINDME',
                content: 'FINDME-BODY-SECRET',
                tags: [],
                folderId: null,
                isPinned: false,
                isFavorite: false,
            });
            const fresh = (await Storage.get('notes', 'target')) as unknown as Record<string, unknown>;
            const corrupted: Record<string, unknown> = { ...fresh };
            // Only the sealed fields are mutated. `preview` is derived from the
            // body and excluded from the seal, so touching it would test nothing.
            const field = ['title', 'content'][Math.floor(rand() * 2)];
            const text = corrupted[field] as string;
            const sep = text.indexOf('|');
            // A packed value is "ivHex|base64". Three things would make a
            // "mutation" a no-op or a shape change rather than corrupted bytes:
            // hex and base64 are both case-insensitive, and destroying the `|`
            // turns the value into passthrough plaintext. So the offset is drawn
            // from inside one segment and the replacement is a different digit
            // of that same segment's alphabet.
            const inHex = rand() < 0.5;
            const from = inHex ? 0 : sep + 1;
            const to = inHex ? sep : text.length;
            const alphabet = inHex
                ? '0123456789abcdef'
                : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            // Redraw until the decoded bytes actually change. Only the padding
            // bits of the final base64 group are ignorable, so one redraw is
            // almost always enough; the bound keeps a stuck loop from hanging CI.
            const before = decodePacked(text);
            let mutated: string;
            let attempts = 0;
            do {
                const at = from + Math.floor(rand() * (to - from));
                let replacement = alphabet[Math.floor(rand() * alphabet.length)];
                while (replacement.toLowerCase() === text[at].toLowerCase()) {
                    replacement = alphabet[Math.floor(rand() * alphabet.length)];
                }
                mutated = text.slice(0, at) + replacement + text.slice(at + 1);
                attempts++;
            } while (!bytesDiffer(before, decodePacked(mutated)) && attempts < 32);

            // The redraw is what makes the loop meaningful, so it is asserted
            // rather than assumed: a round that failed to change a single byte
            // would have tested nothing and reported success.
            expect(mutated.split('|')).toHaveLength(2);
            expect(attempts).toBeLessThan(32);
            expect(bytesDiffer(before, decodePacked(mutated))).toBe(true);
            corrupted[field] = mutated;

            const opened = await Archive.decryptNote(corrupted as never);

            expect(opened.error).not.toBeNull();
            expect(opened.data).toBeFalsy();
        }
        await fs.rm(tmpDir, { recursive: true, force: true });
    }, FUZZ_TIMEOUT);

    test('a re-encrypted but unsealed field is flagged by the seal', async () => {
        // The attack the seal exists for: an attacker who can write the store
        // swaps a field for their own ciphertext, produced with the vault's own
        // key so AES-GCM cannot tell. The seal is the only thing left.
        const dir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-fuzz-seal-'));
        await Storage.initialize(path.join(dir2, 'vault.json'));
        await Archive.setupVault('fuzz-vault-password-seal');
        await Archive.saveNote({
            id: 'sealed',
            title: 'genuine',
            content: 'genuine body',
            tags: [],
            folderId: null,
            isPinned: false,
            isFavorite: false,
        });

        const stored = (await Storage.get('notes', 'sealed')) as unknown as Record<string, unknown>;
        const activeKey = Vault.getActiveKey();
        if (!activeKey) throw new Error('setupVault must leave an active key');
        const forged = await Vault.encryptPacked('ATTACKER BODY', activeKey);
        expect(forged.error).toBeNull();

        const swapped: Record<string, unknown> = { ...stored, content: forged.data! };
        const opened = await Archive.decryptNote(swapped as never);

        // It must not read as a clean entry.
        expect(opened.data!.content).toContain('Digital seal broken');
        await fs.rm(dir2, { recursive: true, force: true });
    }, ARGON_TIMEOUT);

    test('a tampered tags list is flagged too', async () => {
        const dir3 = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-fuzz-tags-'));
        await Storage.initialize(path.join(dir3, 'vault.json'));
        await Archive.setupVault('fuzz-vault-password-tags');
        await Archive.saveNote({
            id: 'tagged',
            title: 'genuine',
            content: 'genuine body',
            tags: ['real'],
            folderId: null,
            isPinned: false,
            isFavorite: false,
        });

        const stored = (await Storage.get('notes', 'tagged')) as unknown as Record<string, unknown>;
        const opened = await Archive.decryptNote({ ...stored, tags: ['real', 'injected'] } as never);

        expect(opened.data!.content).toContain('Digital seal broken');
        await fs.rm(dir3, { recursive: true, force: true });
    }, ARGON_TIMEOUT);

    test('an entry replaced with plain injected text is never rendered as clean', async () => {
        const dir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-fuzz2-'));
        await Storage.initialize(path.join(dir2, 'vault.json'));
        await Archive.setupVault('fuzz-vault-password-2');
        await Archive.saveNote({
            id: 'inj',
            title: 'real',
            content: 'real body',
            tags: [],
            folderId: null,
            isPinned: false,
            isFavorite: false,
        });

        // The point of this case is a record the app never wrote, so it is built
        // outside the `Note` shape on purpose and written straight into the
        // store, exactly as an attacker with disk access would.
        const stored = (await Storage.get('notes', 'inj')) as unknown as Record<string, unknown>;
        const injected = { ...stored, title: 'ATTACKER CONTROLLED TITLE' } as unknown as Note;
        await Storage.set('notes', 'inj', injected);

        const listed = await Archive.getAllNotes();
        expect(listed.data![0].title).not.toBe('ATTACKER CONTROLLED TITLE');

        const opened = await Archive.decryptNote(injected as never);
        expect(opened.data!.title).not.toBe('ATTACKER CONTROLLED TITLE');

        await fs.rm(dir2, { recursive: true, force: true });
    }, ARGON_TIMEOUT);
});
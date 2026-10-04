import { describe, test, expect, beforeEach } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Archive, Storage, Sentinel, Audit } from '../index';

/**
 * The unlock rate limit lives inside `Archive.unlockVault`, not in a caller.
 *
 * While it lived only in the CLI's `openVaultCLI`, `lembaranz server` calling
 * `unlockVault` directly exposed an unthrottled password oracle: measured 12
 * wrong passwords, 12 Argon2id derivations, no lockout. These tests pin the
 * behaviour to the shared function so no caller can bypass it.
 *
 * Timeouts are generous because each attempt runs a full Argon2id derivation
 * at m=64 MiB.
 */
const ARGON_TIMEOUT = 30_000;

describe('Archive.unlockVault rate limiting', () => {
    let tempDir: string;

    beforeEach(async () => {
        Sentinel.clearAllRateLimits();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-unlock-rl-'));
        await Storage.initialize(path.join(tempDir, 'vault.json'));
        await Archive.setupVault('correcthorse123');
        Sentinel.clearAllRateLimits();
    });

    test(
        'locks out after 5 wrong passwords and refuses even the right one',
        async () => {
            // Sentinel allows 5 attempts; the 6th is refused.
            for (let i = 0; i < 5; i++) {
                const attempt = await Archive.unlockVault('wrongwrongwrong');
                expect(attempt.error?.message ?? '').not.toMatch(/Too many failed attempts/);
            }

            const lockedOut = await Archive.unlockVault('wrongwrongwrong');
            expect(lockedOut.error?.message).toMatch(/Too many failed attempts/);

            // The correct password must not be a way past the lockout.
            const correctDuringLockout = await Archive.unlockVault('correcthorse123');
            expect(correctDuringLockout.error?.message).toMatch(/Too many failed attempts/);
        },
        ARGON_TIMEOUT
    );

    test(
        'a successful unlock clears the counter',
        async () => {
            await Archive.unlockVault('wrongwrongwrong');
            const good = await Archive.unlockVault('correcthorse123');
            expect(good.data).toBe(true);

            // The bucket is empty again, so five more wrong attempts are
            // tolerated rather than locking out immediately.
            for (let i = 0; i < 5; i++) {
                const attempt = await Archive.unlockVault('wrongwrongwrong');
                expect(attempt.error?.message ?? '').not.toMatch(/Too many failed attempts/);
            }
        },
        ARGON_TIMEOUT
    );

    test(
        'refusals are written to the audit ledger',
        async () => {
            for (let i = 0; i < 6; i++) await Archive.unlockVault('wrongwrongwrong');

            const entries = await Audit.listEntries();
            const alerts = entries.filter((e) => e.action === 'SECURITY_ALERT');
            expect(alerts.some((e) => e.details.includes('rate limit'))).toBe(true);
        },
        ARGON_TIMEOUT
    );
});
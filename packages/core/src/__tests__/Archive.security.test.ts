import { beforeEach, describe, expect, test } from 'bun:test';
import os from 'node:os';
import path from 'node:path';
import { Archive } from '../Archive';
import { Sentinel } from '../Sentinel';
import { Storage } from '../Storage';
import { Vault } from '../Vault';

const TEST_PASSWORD = 'SecurePass123!';

describe('Archive security hardening', () => {
    beforeEach(async () => {
        const uniqueDbPath = path.join(os.tmpdir(), `.lembaranz-test-${Date.now()}-${Math.random()}.json`);
        await Storage.initialize(uniqueDbPath);
        await Archive.destroyAllData();
        Sentinel.clearAllRateLimits();
        Vault.clearKey();
    });

    test('unlockVault enforces global rate limiting on repeated failures', async () => {
        const setup = await Archive.setupVault(TEST_PASSWORD);
        expect(setup.error).toBeNull();
        Vault.clearKey();

        for (let i = 0; i < 5; i++) {
            const fail = await Archive.unlockVault('wrong-password');
            expect(fail.data).toBe(false);
        }

        const blocked = await Archive.unlockVault('wrong-password');
        expect(blocked.error).not.toBeNull();
        expect(blocked.error?.message).toContain('Too many failed attempts');
    });
});

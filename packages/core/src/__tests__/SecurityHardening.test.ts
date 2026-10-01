import { describe, test, expect } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { FileAdapter } from '../storage/FileAdapter';

describe('Security Hardening: File Permissions', () => {
    test('vault database file should be created with 600 permissions', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-security-'));
        const dbPath = path.join(tempDir, 'vault.json');
        const adapter = new FileAdapter(dbPath);

        // Trigger a save
        await adapter.set('kv', 'test_key', 'test_value');

        const stats = await fs.stat(dbPath);
        const mode = stats.mode & 0o777;

        expect(mode.toString(8)).toBe('600');

        await fs.rm(tempDir, { recursive: true, force: true });
    });
});

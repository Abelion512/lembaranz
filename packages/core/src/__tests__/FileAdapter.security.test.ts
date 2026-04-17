import { describe, expect, test } from 'bun:test';
import os from 'node:os';
import path from 'node:path';
import { FileAdapter } from '../storage/FileAdapter';

describe('FileAdapter security hardening', () => {
    test('rejects dangerous prototype keys on set', async () => {
        const filePath = path.join(os.tmpdir(), `.lembaranz-file-adapter-${Date.now()}.json`);
        const adapter = new FileAdapter(filePath);

        await expect(adapter.set('kv', '__proto__', 'polluted')).rejects.toThrow('Invalid key');
    });
});

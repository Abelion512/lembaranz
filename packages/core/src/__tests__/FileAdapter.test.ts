import { describe, test, expect } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { FileAdapter } from '../storage/FileAdapter';

describe('FileAdapter load error handling', () => {
    test('initializes empty store when DB file does not exist', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-file-adapter-'));
        const dbPath = path.join(tempDir, 'db.json');
        const adapter = new FileAdapter(dbPath);

        const notes = await adapter.getAll('notes');
        const folders = await adapter.getAll('folders');

        expect(notes).toEqual([]);
        expect(folders).toEqual([]);
    });

    test('throws for malformed JSON and does not auto-reset file', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-file-adapter-'));
        const dbPath = path.join(tempDir, 'db.json');
        const malformedContent = '{"notes": {';
        await fs.writeFile(dbPath, malformedContent, 'utf-8');

        const adapter = new FileAdapter(dbPath);

        let caughtError: Error | null = null;
        try {
            await adapter.getAll('notes');
        } catch (error) {
            caughtError = error as Error;
        }

        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toContain('invalid JSON in DB file');

        const persistedContent = await fs.readFile(dbPath, 'utf-8');
        expect(persistedContent).toBe(malformedContent);
    });
});

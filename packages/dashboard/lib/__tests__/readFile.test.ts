import { describe, test, expect, spyOn, afterEach, beforeEach } from 'bun:test';
import fs from 'fs/promises';

import { readFile } from '../readFile';

describe('readFile', () => {
    let statSpy: any;
    let readFileSpy: any;

    beforeEach(() => {
        statSpy = spyOn(fs, 'stat');
        readFileSpy = spyOn(fs, 'readFile');
    });

    afterEach(() => {
        statSpy.mockRestore();
        readFileSpy.mockRestore();
    });

    test('should return null for invalid inputs', async () => {
        expect(await readFile(undefined as any)).toBeNull();
        expect(await readFile(null as any)).toBeNull();
        expect(await readFile('')).toBeNull();
        expect(await readFile(123 as any)).toBeNull();
    });

    test('should prevent path traversal outside docs or public', async () => {
        // Since the first directory component after normalization must be docs or public,
        // it shouldn't even attempt to call fs.stat.
        const result = await readFile('../../../etc/passwd');
        expect(result).toBeNull();
        expect(statSpy).not.toHaveBeenCalled();
    });

    test('should prevent null byte poisoning', async () => {
        // Null bytes should be stripped.
        // It becomes "public/test.txt"
        statSpy.mockResolvedValue({ isFile: () => true } as any);
        readFileSpy.mockResolvedValue('content' as any);
        const result = await readFile('public/test.txt\0');
        expect(result).toBe('content');
    });

    test('should block access if first part is not docs or public', async () => {
        const result = await readFile('secret/keys.txt');
        expect(result).toBeNull();
        expect(statSpy).not.toHaveBeenCalled();
    });

    test('should successfully read a file from the docs folder', async () => {
        statSpy.mockResolvedValue({ isFile: () => true } as any);
        readFileSpy.mockResolvedValue('document content' as any);

        const result = await readFile('docs/guide.md');

        expect(result).toBe('document content');
        expect(statSpy).toHaveBeenCalled();
        expect(readFileSpy).toHaveBeenCalled();

        // Ensure that we searched for the correct file path.
        // We just verify it calls fs.readFile with the resolved path.
        const calledPath = readFileSpy.mock.calls[0][0];
        expect(calledPath).toContain('docs');
    });

    test('should return null if file is not a file (e.g. directory)', async () => {
        statSpy.mockResolvedValue({ isFile: () => false } as any);
        const result = await readFile('docs/folder');
        expect(result).toBeNull();
        expect(readFileSpy).not.toHaveBeenCalled();
    });

    test('should return null if fs.stat throws error for all search locations', async () => {
        statSpy.mockRejectedValue(new Error('ENOENT'));
        const result = await readFile('docs/notfound.md');
        expect(result).toBeNull();
        expect(readFileSpy).not.toHaveBeenCalled();
    });
});

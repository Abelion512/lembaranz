import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Vault } from '../Vault';
import { FileAdapter } from '../storage/FileAdapter';

/**
 * Regressions for three defects found auditing the storage and crypto paths.
 *
 * Each test fails against the code as it was before the fix.
 */

describe('Vault.hexToBytes rejects non-hex input', () => {
    // The nibble math is `(c & 0xf) + (c >> 6) * 9`, an identity on [0-9a-f]
    // only. Unguarded, other characters collide onto valid nibbles: 'z' -> 3,
    // 'G' -> 10, '-' -> 13. A tampered or corrupt IV segment therefore decoded
    // to the wrong bytes instead of failing.
    test('rejects characters that the nibble math would silently remap', () => {
        for (const bad of ['zz', 'GG', '--', '!@', 'GGGG', 'zzzz']) {
            expect(() => Vault.hexToBytes(bad)).toThrow(/Invalid hex/);
        }
    });

    test('rejects an odd-length string', () => {
        expect(() => Vault.hexToBytes('abc')).toThrow(/Invalid hex string length/);
    });

    test('still decodes valid lower, upper and mixed case', () => {
        expect([...Vault.hexToBytes('aabb')]).toEqual([0xaa, 0xbb]);
        expect([...Vault.hexToBytes('AABB')]).toEqual([0xaa, 0xbb]);
        expect([...Vault.hexToBytes('00ff10')]).toEqual([0x00, 0xff, 0x10]);
    });
});

describe('Vault.isPacked distinguishes ciphertext from injected plaintext', () => {
    test('accepts the packed form encryptPacked writes', async () => {
        const key = (await Vault.generateMasterKey()).data!;
        const packed = (await Vault.encryptPacked('hello', key)).data!;
        expect(Vault.isPacked(packed)).toBe(true);
    });

    test('rejects bare plaintext, which decryptPacked passes through', async () => {
        const key = (await Vault.generateMasterKey()).data!;
        await Vault.setActiveKey(key);
        // decryptPacked returns any string without "|" as-is, for entries written
        // before encryption existed. That is why a successful decrypt is not proof
        // a field was ever sealed.
        expect((await Vault.decryptPacked('INJECTED BY ATTACKER')).data).toBe('INJECTED BY ATTACKER');
        expect(Vault.isPacked('INJECTED BY ATTACKER')).toBe(false);
        Vault.clearKey();
    });

    test('rejects a malformed IV segment of the right length', () => {
        expect(Vault.isPacked('z'.repeat(24) + '|AAAA')).toBe(false);
        expect(Vault.isPacked('abcd|AAAA')).toBe(false);
        expect(Vault.isPacked(null)).toBe(false);
        expect(Vault.isPacked(42)).toBe(false);
    });
});

describe('FileAdapter.load shares one in-flight read', () => {
    let tempDir: string;
    let dbPath: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-load-race-'));
        dbPath = path.join(tempDir, 'db.json');
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    // Root cause: load() was `if (this.data) return this.data;` followed by an
    // async readFile. Concurrent first-touches all passed that check, each built
    // its own document object, and the last to resolve replaced the others. The
    // save queue was fine; the lost writes came from discarded documents.
    test('concurrent sets on a cold adapter all persist', async () => {
        const adapter = new FileAdapter(dbPath);

        await Promise.all(
            Array.from({ length: 25 }, (_, i) => adapter.set('kv', `k${i}`, `v${i}`))
        );

        const onDisk = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
        expect(Object.keys(onDisk.kv).length).toBe(25);
        await expect(adapter.count('kv')).resolves.toBe(25);
    });

    test('concurrent first-touch reads observe the same document object', async () => {
        const adapter = new FileAdapter(dbPath);
        const [a, b, c] = await Promise.all([
            adapter.getAll('notes'),
            adapter.getAll('folders'),
            adapter.getAll('kv'),
        ]);
        expect(a).toEqual([]);
        expect(b).toEqual([]);
        expect(c).toEqual([]);
    });

    test('a warm adapter is unaffected', async () => {
        const adapter = new FileAdapter(dbPath);
        await adapter.get('meta', 'warmup');
        await Promise.all(
            Array.from({ length: 10 }, (_, i) => adapter.set('kv', `k${i}`, `v${i}`))
        );
        await expect(adapter.count('kv')).resolves.toBe(10);
    });
});

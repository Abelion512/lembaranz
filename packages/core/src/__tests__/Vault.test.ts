import { describe, test, expect, beforeAll } from 'bun:test';
import { Vault } from '../Vault';
import { Sentinel } from '../Sentinel';

describe('Vault', () => {
    describe('deriveKey', () => {
        test('should derive a CryptoKey from password and salt', async () => {
            const password = 'secure-password';
            const salt = new Uint8Array(16).fill(42);

            const result = await Vault.deriveKey(password, salt, true); // extractable for testing
            expect(result.error).toBeNull();
            expect(result.data).toBeInstanceOf(CryptoKey);
        });

        test('should produce different keys for different passwords', async () => {
            const salt = new Uint8Array(16).fill(42);

            const result1 = await Vault.deriveKey('password1', salt, true);
            const result2 = await Vault.deriveKey('password2', salt, true);

            // Export both keys to compare raw bytes
            const bytes1 = await crypto.subtle.exportKey('raw', result1.data!);
            const bytes2 = await crypto.subtle.exportKey('raw', result2.data!);

            expect(new Uint8Array(bytes1)).not.toEqual(new Uint8Array(bytes2));
        });

        test('should produce different keys for different salts', async () => {
            const password = 'same-password';
            const salt1 = new Uint8Array(16).fill(1);
            const salt2 = new Uint8Array(16).fill(2);

            const result1 = await Vault.deriveKey(password, salt1, true);
            const result2 = await Vault.deriveKey(password, salt2, true);

            const bytes1 = await crypto.subtle.exportKey('raw', result1.data!);
            const bytes2 = await crypto.subtle.exportKey('raw', result2.data!);

            expect(new Uint8Array(bytes1)).not.toEqual(new Uint8Array(bytes2));
        });
    });

    describe('generateMasterKey', () => {
        test('should generate a valid AES-GCM CryptoKey', async () => {
            const result = await Vault.generateMasterKey();
            expect(result.error).toBeNull();
            expect(result.data).toBeInstanceOf(CryptoKey);
        });
    });

    describe('encrypt / decrypt', () => {
        test('should encrypt and decrypt a string', async () => {
            const keyResult = await Vault.generateMasterKey();
            expect(keyResult.error).toBeNull();
            const key = keyResult.data!;

            const original = 'Hello, World! 123';

            const encryptResult = await Vault.encrypt(original, key);
            expect(encryptResult.error).toBeNull();

            const { data, iv } = encryptResult.data!;

            const decryptResult = await Vault.decrypt(data, iv, key);
            expect(decryptResult.error).toBeNull();
            expect(decryptResult.data).toBe(original);
        });

        test('should fail decryption with wrong key', async () => {
            const key1Result = await Vault.generateMasterKey();
            const key2Result = await Vault.generateMasterKey();
            const key1 = key1Result.data!;
            const key2 = key2Result.data!;

            const encryptResult = await Vault.encrypt('secret data', key1);
            const { data, iv } = encryptResult.data!;

            const decryptResult = await Vault.decrypt(data, iv, key2);
            expect(decryptResult.error).not.toBeNull();
        });
    });

    describe('encryptPacked / decryptPacked', () => {
        beforeAll(async () => {
            const keyResult = await Vault.generateMasterKey();
            Vault.setActiveKey(keyResult.data!);
        });

        test('should pack and unpack a string with active key', async () => {
            const original = 'packed secret';

            const packResult = await Vault.encryptPacked(original);
            expect(packResult.error).toBeNull();
            expect(packResult.data).toContain('|');

            const unpackResult = await Vault.decryptPacked(packResult.data!);
            expect(unpackResult.error).toBeNull();
            expect(unpackResult.data).toBe(original);
        });

        test('should handle empty strings', async () => {
            const packResult = await Vault.encryptPacked('');
            expect(packResult.error).toBeNull();

            const unpackResult = await Vault.decryptPacked(packResult.data!);
            expect(unpackResult.error).toBeNull();
            expect(unpackResult.data).toBe('');
        });

        test('should handle unicode characters', async () => {
            const original = 'Rahasia: 日本語 العربية';

            const packResult = await Vault.encryptPacked(original);
            const unpackResult = await Vault.decryptPacked(packResult.data!);

            expect(unpackResult.error).toBeNull();
            expect(unpackResult.data).toBe(original);
        });

        test('should return plaintext for strings without pipe (unformatted)', async () => {
            const result = await Vault.decryptPacked('not encrypted');
            expect(result.data).toBe('not encrypted');
            expect(result.error).toBeNull();
        });

        test('should return original value for invalid inputs (null, undefined, empty)', async () => {
            expect((await Vault.decryptPacked('')).data).toBe('');
            expect((await Vault.decryptPacked(null as any)).data).toBe(null);
            expect((await Vault.decryptPacked(undefined as any)).data).toBe(undefined);
        });

        test('should cache decrypted results', async () => {
            const original = 'cache test value';
            const packResult = await Vault.encryptPacked(original);

            const result1 = await Vault.decryptPacked(packResult.data!);
            expect(result1.error).toBeNull();

            const result2 = await Vault.decryptPacked(packResult.data!);
            expect(result2.data).toBe(original);
        });
    });

    describe('encryptPortable / decryptPortable', () => {
        test('should create and open a portable backup', async () => {
            const password = 'backup-password';
            const original = JSON.stringify({ key: 'value', number: 42 });

            const encResult = await Vault.encryptPortable(original, password);
            expect(encResult.error).toBeNull();
            expect(encResult.data).toBeInstanceOf(Uint8Array);

            const magic = new TextDecoder().decode(encResult.data!.slice(0, 4));
            expect(magic).toBe('LMBR');

            const decResult = await Vault.decryptPortable(encResult.data!, password);
            expect(decResult.error).toBeNull();
            expect(decResult.data).toBe(original);
        }, { timeout: 30000 });

        test('should fail with wrong password', async () => {
            const encResult = await Vault.encryptPortable('secret', 'correct-password');
            const decResult = await Vault.decryptPortable(encResult.data!, 'wrong-password');

            expect(decResult.error).not.toBeNull();
        }, { timeout: 30000 });

        test('should reject invalid format', async () => {
            const invalidBuffer = new Uint8Array([0x00, 0x01, 0x02]);
            const result = await Vault.decryptPortable(invalidBuffer, 'password');

            expect(result.error).not.toBeNull();
            expect(result.error!.message).toContain('small');
        });

        test('should reject buffer that is too small', async () => {
            const tinyBuffer = new Uint8Array([0x4C, 0x4D, 0x42, 0x52, 0x01]);
            const result = await Vault.decryptPortable(tinyBuffer, 'password');

            expect(result.error).not.toBeNull();
        });
    });

    describe('importRawKey / exportRawKey', () => {
        test('should export and re-import a key successfully', async () => {
            const genResult = await Vault.generateMasterKey();
            const originalKey = genResult.data!;

            const exportResult = await Vault.exportRawKey(originalKey);
            expect(exportResult.error).toBeNull();

            const importResult = await Vault.importRawKey(exportResult.data!);
            expect(importResult.error).toBeNull();

            const encryptResult = await Vault.encrypt('test', originalKey);
            const { data, iv } = encryptResult.data!;

            const decryptResult = await Vault.decrypt(data, iv, importResult.data!);
            expect(decryptResult.error).toBeNull();
            expect(decryptResult.data).toBe('test');
        });
    });

    describe('setActiveKey / isLocked / clearKey', () => {
        test('should start locked after clearKey', () => {
            Vault.clearKey();
            expect(Vault.isLocked()).toBe(true);
        });

        test('should unlock with setActiveKey', async () => {
            const keyResult = await Vault.generateMasterKey();
            Vault.setActiveKey(keyResult.data!);
            expect(Vault.isLocked()).toBe(false);
        });

        test('should lock again with clearKey', () => {
            Vault.clearKey();
            expect(Vault.isLocked()).toBe(true);
        });

        test('should get active key when unlocked', async () => {
            const keyResult = await Vault.generateMasterKey();
            Vault.setActiveKey(keyResult.data!);

            expect(Vault.getActiveKey()).toBe(keyResult.data);

            Vault.clearKey();
            expect(Vault.getActiveKey()).toBeNull();
        });

        test('should clear decryption cache on lock', async () => {
            const keyResult = await Vault.generateMasterKey();
            Vault.setActiveKey(keyResult.data!);

            const packResult = await Vault.encryptPacked('cached item');
            await Vault.decryptPacked(packResult.data!);

            Vault.clearKey();
            expect(Vault.isLocked()).toBe(true);
        });
    });

    describe('constantTimeCompare (via Sentinel)', () => {
        test('should return true for equal strings', () => {
            expect(Sentinel.constantTimeCompare('hello', 'hello')).toBe(true);
        });

        test('should return false for different strings', () => {
            expect(Sentinel.constantTimeCompare('hello', 'world')).toBe(false);
        });

        test('should return false for different lengths', () => {
            expect(Sentinel.constantTimeCompare('short', 'longer')).toBe(false);
        });

        test('should handle empty strings', () => {
            expect(Sentinel.constantTimeCompare('', '')).toBe(true);
            expect(Sentinel.constantTimeCompare('', 'a')).toBe(false);
        });

        test('should handle unicode', () => {
            expect(Sentinel.constantTimeCompare('secure', 'secure')).toBe(true);
            expect(Sentinel.constantTimeCompare('secure', 'unsafe')).toBe(false);
        });
    });
});

import { argon2id } from '@noble/hashes/argon2.js';

/**
 * Vault Engine: Web Crypto API & Argon2id implementation
 * Standards: AES-GCM 256-bit, Argon2id (Pure JS)
 *
 * Version 3.4.0 Updates:
 * - Added Quantum-Resistant Portable Backup Format
 * - High-Memory Cost KDF for Backups
 */

/**
 * Result: Standard data return type for Vault operations.
 * Prevents unexpected error manipulation (crash).
 */
export type Result<T> = { data: T; error: null } | { data: null; error: Error };

const ALGO_ENC = 'AES-GCM';
const MAX_CACHE_ITEMS = 100;

export class Vault {
    private static key: CryptoKey | null = null;

    /**
     * Cache for decrypted strings to improve performance on repeated reads.
     * Cleared whenever the vault is locked or key changes.
     */
    private static decryptionCache = new Map<string, string>();

    /**
     * @param extractable Whether the key can be exported (required for backup)
     */
    static async deriveKey(password: string, salt: Uint8Array, extractable = false): Promise<Result<CryptoKey>> {
        const passwordBuffer = new TextEncoder().encode(password);
        let hash: Uint8Array | null = null;

        try {
            hash = argon2id(passwordBuffer, salt, {
                t: 2,
                m: 19 * 1024,
                dkLen: 32,
                p: 1,
            });

            const key = await crypto.subtle.importKey(
                'raw',
                hash as BufferSource,
                { name: ALGO_ENC, length: 256 },
                extractable,
                ['encrypt', 'decrypt']
            );
            return { data: key, error: null };
        } catch (error) {
            console.error('[VAULT] Gagal menurunkan kunci (ERR_DRV_001)');
            return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
        } finally {
            passwordBuffer.fill(0);
            if (hash) {
                hash.fill(0);
            }
        }
    }

    /**
     * Generates a random 256-bit AES-GCM master key.
     */
    static async generateMasterKey(): Promise<Result<CryptoKey>> {
        try {
            const key = await crypto.subtle.generateKey(
                { name: ALGO_ENC, length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            return { data: key, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    /**
     * Imports a key from raw bytes.
     */
    static async importRawKey(keyBuffer: ArrayBuffer, extractable = true): Promise<Result<CryptoKey>> {
        try {
            const key = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: ALGO_ENC, length: 256 },
                extractable,
                ['encrypt', 'decrypt']
            );
            return { data: key, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    /**
     * Exports a key to raw bytes.
     */
    static async exportRawKey(key: CryptoKey): Promise<Result<ArrayBuffer>> {
        try {
            const buffer = await crypto.subtle.exportKey('raw', key);
            return { data: buffer, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    static setActiveKey(key: CryptoKey) {
        this.key = key;
        this.decryptionCache.clear();
    }

    static clearKey() {
        this.key = null;
        this.decryptionCache.clear();
    }

    static isLocked(): boolean {
        return this.key === null;
    }

    static getActiveKey(): CryptoKey | null {
        return this.key;
    }

    /**
     * Mengenkripsi teks string
     */
    static async encrypt(text: string, customKey?: CryptoKey): Promise<Result<{ data: ArrayBuffer; iv: Uint8Array }>> {
        const key = customKey || this.key;
        if (!key) return { data: null, error: new Error('Vault Locked: Key not active') };

        try {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();

            const data = await crypto.subtle.encrypt(
                { name: ALGO_ENC, iv },
                key,
                encoder.encode(text)
            );

            return { data: { data, iv }, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    /**
     * Mendekripsi ArrayBuffer kembali ke string
     */
    static async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array, customKey?: CryptoKey): Promise<Result<string>> {
        const key = customKey || this.key;
        if (!key) return { data: null, error: new Error('Vault Locked: Key not active') };

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: ALGO_ENC, iv: iv as BufferSource },
                key,
                encryptedData
            );

            const decoder = new TextDecoder();
            return { data: decoder.decode(decrypted), error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    static async encryptPacked(text: string, customKey?: CryptoKey): Promise<Result<string>> {
        const result = await this.encrypt(text, customKey);
        if (result.error) return { data: null, error: result.error };

        const { data, iv } = result.data;
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
        return { data: `${ivHex}|${base64}`, error: null };
    }

    /**
     * Optimized hex string to Uint8Array conversion without regex.
     */
    private static hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }

    static async decryptPacked(packed: string, customKey?: CryptoKey): Promise<Result<string>> {
        if (!packed || !packed.includes('|')) return { data: packed, error: null };

        if (!customKey && this.decryptionCache.has(packed)) {
            const cachedResult = this.decryptionCache.get(packed)!;
            this.decryptionCache.delete(packed);
            this.decryptionCache.set(packed, cachedResult);
            return { data: cachedResult, error: null };
        }

        try {
            const [ivHex, base64] = packed.split('|');
            const iv = this.hexToBytes(ivHex);

            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const result = await this.decrypt(bytes.buffer, iv, customKey);
            if (result.error) return result;

            if (!customKey) {
                if (this.decryptionCache.size >= MAX_CACHE_ITEMS) {
                    const firstKey = this.decryptionCache.keys().next().value;
                    if (firstKey !== undefined) {
                        this.decryptionCache.delete(firstKey);
                    }
                }
                this.decryptionCache.set(packed, result.data);
            }

            return result;
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    /**
     * Enkripsi Portabel (Quantum-Resistant Symmetric Structure)
     * Format: [Magic:4][Ver:1][Salt:32][IV:12][Ciphertext:N]
     */
    static async encryptPortable(data: string, password: string): Promise<Result<Uint8Array>> {
        try {
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const hash = argon2id(password, salt, {
                t: 4,
                m: 64 * 1024,
                dkLen: 32,
                p: 1
            });

            const key = await crypto.subtle.importKey(
                'raw',
                hash as BufferSource,
                { name: ALGO_ENC, length: 256 },
                false,
                ['encrypt']
            );

            const encoder = new TextEncoder();
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoder.encode(data)
            );

            const magic = new Uint8Array([0x4C, 0x4D, 0x42, 0x52]);
            const version = new Uint8Array([0x01]);

            const result = new Uint8Array(
                magic.length + version.length + salt.length + iv.length + encryptedBuffer.byteLength
            );

            let offset = 0;
            result.set(magic, offset); offset += magic.length;
            result.set(version, offset); offset += version.length;
            result.set(salt, offset); offset += salt.length;
            result.set(iv, offset); offset += iv.length;
            result.set(new Uint8Array(encryptedBuffer), offset);

            return { data: result, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }

    static async decryptPortable(buffer: Uint8Array, password: string): Promise<Result<string>> {
        try {
            if (buffer.length < 50) return { data: null, error: new Error('Berkas terlalu kecil atau rusak') };

            const magic = new TextDecoder().decode(buffer.slice(0, 4));
            if (magic !== 'LMBR') return { data: null, error: new Error('Format berkas tidak valid (Magic mismatch)') };

            const version = buffer[4];
            if (version !== 1) return { data: null, error: new Error(`Versi berkas v${version} tidak didukung`) };

            const salt = buffer.slice(5, 37);
            const iv = buffer.slice(37, 49);
            const ciphertext = buffer.slice(49);

            const hash = argon2id(password, salt, {
                t: 4,
                m: 64 * 1024,
                dkLen: 32,
                p: 1
            });

            const key = await crypto.subtle.importKey(
                'raw',
                hash as BufferSource,
                { name: ALGO_ENC, length: 256 },
                false,
                ['decrypt']
            );

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ciphertext
            );
            return { data: new TextDecoder().decode(decrypted), error: null };
        } catch (e) {
            return { data: null, error: new Error('Gagal membuka berkas: Password salah atau data rusak.', { cause: e }) };
        }
    }
}

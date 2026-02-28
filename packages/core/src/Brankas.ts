import { argon2id } from '@noble/hashes/argon2.js';

/**
 * Brankas Engine: Web Crypto API & Argon2id implementation
 * Standards: AES-GCM 256-bit, Argon2id (Pure JS)
 */

const ALGO_ENC = 'AES-GCM';
const MAX_CACHE_ITEMS = 100;

export class Brankas {
    private static key: CryptoKey | null = null;

    /**
     * Cache for decrypted strings to improve performance on repeated reads.
     * Cleared whenever the vault is locked or key changes.
     */
    private static decryptionCache = new Map<string, string>();

    /**
     * Derives a CryptoKey from a password and salt using Argon2id
     * @param extractable Whether the key should be extractable (needed for recovery setup)
     */
    static async deriveKey(password: string, salt: Uint8Array, extractable = false): Promise<CryptoKey> {
        try {
            // Argon2id parameters (OWASP recommended: 19MB RAM, 2 iterations, 1 parallelism)
            const hash = argon2id(password, salt, {
                t: 2,
                m: 19 * 1024, // 19MB in KB
                dkLen: 32, // 256-bit
                p: 1, // parallelism
            });

            return crypto.subtle.importKey(
                'raw',
                hash as BufferSource,
                { name: ALGO_ENC, length: 256 },
                extractable,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('[BRANKAS] Kunci gagal diturunkan (ERR_DRV_001)');
            throw error;
        }
    }

    /**
     * Generates a random 256-bit AES-GCM master key.
     */
    static async generateMasterKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            { name: ALGO_ENC, length: 256 },
            true, // extractable so it can be wrapped
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Imports a key from raw bytes.
     */
    static async importRawKey(keyBuffer: ArrayBuffer, extractable = true): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: ALGO_ENC, length: 256 },
            extractable,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Exports a key to raw bytes.
     */
    static async exportRawKey(key: CryptoKey): Promise<ArrayBuffer> {
        return crypto.subtle.exportKey('raw', key);
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
     * Encrypts a string of text
     */
    static async encrypt(text: string, customKey?: CryptoKey): Promise<{ data: ArrayBuffer; iv: Uint8Array }> {
        const key = customKey || this.key;
        if (!key) throw new Error('Vault Locked: No active key');

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();

        const data = await crypto.subtle.encrypt(
            { name: ALGO_ENC, iv },
            key,
            encoder.encode(text)
        );

        return { data, iv };
    }

    /**
     * Decrypts an ArrayBuffer back to string
     */
    static async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array, customKey?: CryptoKey): Promise<string> {
        const key = customKey || this.key;
        if (!key) throw new Error('Vault Locked: No active key');

        const decrypted = await crypto.subtle.decrypt(
            { name: ALGO_ENC, iv: iv as BufferSource },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    static async encryptPacked(text: string, customKey?: CryptoKey): Promise<string> {
        const { data, iv } = await this.encrypt(text, customKey);
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
        return `${ivHex}|${base64}`;
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

    static async decryptPacked(packed: string, customKey?: CryptoKey): Promise<string> {
        if (!packed || !packed.includes('|')) return packed;

        if (!customKey && this.decryptionCache.has(packed)) {
            const result = this.decryptionCache.get(packed)!;
            this.decryptionCache.delete(packed);
            this.decryptionCache.set(packed, result);
            return result;
        }

        const [ivHex, base64] = packed.split('|');
        const iv = this.hexToBytes(ivHex);

        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const result = await this.decrypt(bytes.buffer, iv, customKey);

        if (!customKey) {
            if (this.decryptionCache.size >= MAX_CACHE_ITEMS) {
                const firstKey = this.decryptionCache.keys().next().value;
                if (firstKey !== undefined) {
                    this.decryptionCache.delete(firstKey);
                }
            }
            this.decryptionCache.set(packed, result);
        }
        
        return result;
    }
}

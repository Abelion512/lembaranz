import { argon2id } from '@noble/hashes/argon2.js';

/**
 * Brankas Engine: Web Crypto API & Argon2id implementation
 * Standards: AES-GCM 256-bit, Argon2id (Pure JS)
 */

const ALGO_ENC = 'AES-GCM';

export class Brankas {
    private static key: CryptoKey | null = null;

    /**
     * Cache for decrypted strings to improve performance on repeated reads.
     * Cleared whenever the vault is locked or key changes.
     */
    private static decryptionCache = new Map<string, string>();

    /**
     * Derives a CryptoKey from a password and salt using Argon2id
     */
    static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Argon2id derivation failed', error);
            throw error;
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

    static async encryptPacked(text: string): Promise<string> {
        const { data, iv } = await this.encrypt(text);
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

    static async decryptPacked(packed: string): Promise<string> {
        if (!packed || !packed.includes('|')) return packed;

        // Hit cache for O(1) performance boost on repeat reads (Bolt ⚡)
        if (this.decryptionCache.has(packed)) {
            return this.decryptionCache.get(packed)!;
        }

        const [ivHex, base64] = packed.split('|');
        const iv = this.hexToBytes(ivHex);

        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const result = await this.decrypt(bytes.buffer, iv);

        // Populate cache for future hits
        this.decryptionCache.set(packed, result);
        return result;
    }
}

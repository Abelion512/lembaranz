import { argon2id } from '@noble/hashes/argon2.js';

/**
 * Brankas Engine: Web Crypto API & Argon2id implementation
 * Standards: AES-GCM 256-bit, Argon2id (Pure JS)
 *
 * Version 3.4.0 Updates:
 * - Added Quantum-Resistant Portable Backup Format
 * - High-Memory Cost KDF for Backups
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
        let passwordBuffer: Uint8Array | null = null;
        let hash: Uint8Array | null = null;

        try {
            // Convert password to Uint8Array for explicit memory management
            passwordBuffer = new TextEncoder().encode(password);

            // Argon2id parameters (OWASP recommended: 19MB RAM, 2 iterations, 1 parallelism)
            hash = argon2id(passwordBuffer, salt, {
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
        } finally {
            // Sanitize password from memory immediately after use
            if (passwordBuffer) {
                passwordBuffer.fill(0);
                passwordBuffer = null;
            }
            if (hash) {
                hash.fill(0);
                hash = null;
            }
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

    /**
     * Enkripsi Portabel (Quantum-Resistant Symmetric Structure)
     * Format: [Magic:4][Ver:1][Salt:32][IV:12][Ciphertext:N]
     * Salt ditingkatkan ke 32 bytes (256-bit) untuk menahan pre-computation attack masa depan.
     */
    static async encryptPortable(data: string, password: string): Promise<Uint8Array> {
        // 1. Generate Salt 32-byte (256-bit)
        const salt = crypto.getRandomValues(new Uint8Array(32));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // 2. Derive Ephemeral Key (High Cost for Future Proofing)
        // Kita gunakan parameter custom yang lebih berat untuk export file
        // 4 Iterations, 64MB RAM Cost
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

        // 3. Construct Binary Format
        // Magic: LMBR (0x4C 0x4D 0x42 0x52)
        const magic = new Uint8Array([0x4C, 0x4D, 0x42, 0x52]);
        const version = new Uint8Array([0x01]); // Version 1

        // Structure: [Magic 4][Ver 1][Salt 32][IV 12][Ciphertext N]
        const result = new Uint8Array(
            magic.length + version.length + salt.length + iv.length + encryptedBuffer.byteLength
        );

        let offset = 0;
        result.set(magic, offset); offset += magic.length;
        result.set(version, offset); offset += version.length;
        result.set(salt, offset); offset += salt.length;
        result.set(iv, offset); offset += iv.length;
        result.set(new Uint8Array(encryptedBuffer), offset);

        return result;
    }

    static async decryptPortable(buffer: Uint8Array, password: string): Promise<string> {
        // Header Parsing
        if (buffer.length < 50) throw new Error('File terlalu kecil atau rusak.');

        // Check Magic
        const magic = new TextDecoder().decode(buffer.slice(0, 4));
        if (magic !== 'LMBR') throw new Error('Bukan file .lembaran yang valid (Magic Mismatch).');

        // Check Version
        const version = buffer[4];
        if (version !== 1) throw new Error(`Versi file tidak didukung: v${version}`);

        // Extract params based on Version 1 Layout
        const salt = buffer.slice(5, 37); // 32 bytes (5 + 32 = 37)
        const iv = buffer.slice(37, 49);  // 12 bytes (37 + 12 = 49)
        const ciphertext = buffer.slice(49);

        // Re-derive Key
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

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ciphertext
            );
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            // Usually AES-GCM throws if tag mismatch (auth fail) or key wrong
            throw new Error('Gagal membuka berkas: Password salah atau integritas data rusak.', { cause: e });
        }
    }
}

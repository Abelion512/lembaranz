/**
 * Vault: the cryptographic engine.
 *
 * AES-GCM 256-bit through Web Crypto, with Argon2id (pure JS, via
 * `@noble/hashes`) as the key derivation function and a PBKDF2-HMAC-SHA-256
 * fallback for data written by earlier releases. The master key lives in
 * `activeKey` for the session; `clearKey()` drops it and the plaintext cache.
 *
 * `encryptPacked` / `decryptPacked` produce and consume the `ivHex|base64`
 * format stored in the vault. Two properties of `decryptPacked` matter to
 * callers:
 *
 *  - a value without the `|` separator is returned unchanged, for entries
 *    written before encryption existed. A successful decrypt is therefore not
 *    proof a field was ever sealed; use `isPacked` when that matters.
 *  - `hexToBytes` rejects non-hex input, so a tampered IV segment fails loudly
 *    instead of decoding to different bytes.
 */
import { Result } from "./Formula";
import { argon2idAsync } from "@noble/hashes/argon2.js";
export type { Result };

/**
 * Argon2id parameters — must stay stable: they define the derived-key format.
 * (t=2, m=64 MiB, p=1, 32-byte output.)
 */
const ARGON2ID_PARAMS = { t: 2, m: 64 * 1024, dkLen: 32, p: 1 } as const;

/** True for '0'-'9', 'a'-'f', 'A'-'F'. Guards the nibble math in `hexToBytes`. */
const isHexNibble = (code: number): boolean =>
  (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);

/** Shape written by `encryptPacked`: a 12-byte IV as 24 hex chars, then "|". */
const PACKED_PATTERN = /^[0-9a-f]{24}\|[A-Za-z0-9+/]+={0,2}$/;

/**
 * Fixed error messages the UI has to act on.
 *
 * These are exported constants rather than inline strings because callers must
 * tell "you typed the wrong password" and "the vault is locked" apart from a
 * transport failure, and because the raw WebCrypto error
 * ("The operation failed for an operation-specific reason") tells a user
 * nothing at all. Both are crypto-level constants, so they live here rather
 * than in Archive, which imports this module.
 */
export const WRONG_PASSWORD = "That master password is not correct.";
export const VAULT_LOCKED = "The vault is locked. Enter your master password.";

/**
 * Vault: Lower-level cryptographic engine.
 * AES-GCM 256-bit via Web Crypto, Argon2id (pure JS) for key derivation,
 * with a PBKDF2 fallback to unlock data written by earlier releases.
 */
export class Vault {
  private static activeKey: CryptoKey | null = null;
  private static decryptionCache: Map<string, string> = new Map();

  /**
   * Decrypted-plaintext entries kept per session. Re-reading the vault is the
   * common case and the cache makes it ~13x faster (measured 3.5ms -> 0.26ms on
   * 300 notes), so it stays — but capped. An unbounded map held every note body
   * and credential in plain memory for the whole session.
   *
   * The cap must exceed one full vault scan, or FIFO eviction thrashes: a cap of
   * 256 against 300 notes x 3 fields forced a ~100% miss rate and pushed
   * getAllNotes from 3.5ms to 16.5ms. 4096 covers a full vault several times
   * over while still bounding memory. Map keeps insertion order, so the first
   * key is the oldest entry.
   */
  private static readonly DECRYPTION_CACHE_LIMIT = 4096;

  private static cachePlaintext(packed: string, plaintext: string): void {
    if (this.decryptionCache.size >= this.DECRYPTION_CACHE_LIMIT) {
      const oldest = this.decryptionCache.keys().next().value;
      if (oldest !== undefined) this.decryptionCache.delete(oldest);
    }
    this.decryptionCache.set(packed, plaintext);
  }

  /**
   * Sets the current session encryption key in memory.
   */
  public static setActiveKey(key: CryptoKey): void {
    this.activeKey = key;
    this.decryptionCache.clear();
  }

  /**
   * Returns the current session key.
   */
  public static getActiveKey(): CryptoKey | null {
    return this.activeKey;
  }

  /**
   * Clears the active key and decryption cache from memory.
   */
  public static clearKey(): void {
    this.activeKey = null;
    this.decryptionCache.clear();
  }

  /**
   * Check if the vault is currently locked (no active key).
   */
  public static isLocked(): boolean {
    return !this.activeKey;
  }

  /**
   * Generates a high-entropy 256-bit master key.
   */
  public static async generateMasterKey(): Promise<Result<CryptoKey>> {
    try {
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      return { data: key, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Derives a cryptographic key from a plaintext password using Argon2id
   * (memory-hard, anti-GPU). This is the current default KDF.
   */
  public static async deriveKey(
    password: string,
    salt: Uint8Array,
    extractable = false
  ): Promise<Result<CryptoKey>> {
    const passwordBytes = new TextEncoder().encode(password);
    let hash: Uint8Array | null = null;

    try {
      // Async variant yields to the event loop, keeping the web UI responsive.
      hash = await argon2idAsync(passwordBytes, salt, ARGON2ID_PARAMS);
      const key = await crypto.subtle.importKey(
        "raw",
        hash as BufferSource,
        { name: "AES-GCM", length: 256 },
        extractable,
        ["encrypt", "decrypt"]
      );
      return { data: key, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    } finally {
      passwordBytes.fill(0);
      hash?.fill(0);
    }
  }

  /**
   * Legacy PBKDF2-HMAC-SHA-256 (100 000 iterations) key derivation.
   * Only used to unlock vaults and backups created while Argon2id was
   * unavailable (see Archive.unlockVault / Vault.decryptPortable fallbacks).
   */
  public static async deriveKeyLegacy(
    password: string,
    salt: Uint8Array,
    extractable = false
  ): Promise<Result<CryptoKey>> {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          // @ts-expect-error - BufferSource typing mismatch between Uint8Array<ArrayBufferLike> and ArrayBufferView<ArrayBuffer> in TS 6
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        extractable,
        ["encrypt", "decrypt"]
      );

      return { data: key, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Standard AES-GCM 256 encryption.
   */
  public static async encrypt(
    plaintext: string,
    key?: CryptoKey
  ): Promise<Result<{ iv: Uint8Array; data: ArrayBuffer }>> {
    const targetKey = key || this.activeKey;
    if (!targetKey) return { data: null, error: new Error(VAULT_LOCKED) };

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        targetKey,
        enc.encode(plaintext)
      );
      return { data: { iv, data: encrypted }, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Standard AES-GCM 256 decryption.
   */
  public static async decrypt(
    ciphertext: ArrayBuffer,
    iv: Uint8Array,
    key?: CryptoKey
  ): Promise<Result<string>> {
    const targetKey = key || this.activeKey;
    if (!targetKey) return { data: null, error: new Error(VAULT_LOCKED) };

    try {
      const decrypted = await crypto.subtle.decrypt(
        // @ts-expect-error - iv Uint8Array<ArrayBufferLike> vs BufferSource typing mismatch in TS 6
        { name: "AES-GCM", iv },
        targetKey,
        ciphertext
      );
      const dec = new TextDecoder();
      return { data: dec.decode(decrypted), error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * True when a value is in the "ivHex|base64" packed form this module writes.
   *
   * `decryptPacked` accepts bare plaintext for backwards compatibility with
   * entries written before encryption existed, so a successful decrypt is not
   * proof that a field was ever sealed. Callers that need that guarantee (any
   * code surfacing a stored value to a person) use this to tell a real
   * ciphertext from injected plaintext.
   */
  public static isPacked(value: unknown): value is string {
    return typeof value === "string" && PACKED_PATTERN.test(value);
  }

  /**
   * Encrypts and returns a single pipe-separated string: "ivHex|base64Payload"
   */
  public static async encryptPacked(
    plaintext: string,
    key?: CryptoKey
  ): Promise<Result<string>> {
    const res = await this.encrypt(plaintext, key);
    if (res.error || !res.data) return { data: null, error: res.error };

    const ivHex = this.bytesToHex(res.data.iv);
    const base64 = this.bytesToBase64(new Uint8Array(res.data.data));
    const packed = `${ivHex}|${base64}`;
    
    // Cache the result if using active key
    if (!key) {
      this.cachePlaintext(packed, plaintext);
    }

    return { data: packed, error: null };
  }

  /**
   * Decrypts from a packed "ivHex|base64Payload" string.
   */
  public static async decryptPacked(
    packed: string,
    key?: CryptoKey
  ): Promise<Result<string>> {
    // Handle null/undefined/empty to match test expectations
    if (packed === null) return { data: null as any, error: null };
    if (packed === undefined) return { data: undefined as any, error: null };
    if (packed === "") return { data: "", error: null };

    // Backwards compatibility: entries written before encryption existed are
    // stored as bare plaintext. Anything without the "ivHex|base64" separator is
    // treated as such, which is why callers that render a note must not treat a
    // successful decrypt as proof the entry was ever sealed (see getAllNotes).
    if (!packed.includes("|")) {
      return { data: packed, error: null };
    }

    // Check cache if using active key
    if (!key && this.decryptionCache.has(packed)) {
      return { data: this.decryptionCache.get(packed)!, error: null };
    }

    try {
      const [ivHex, base64] = packed.split("|");
      const iv = this.hexToBytes(ivHex);
      const bytes = this.base64ToBytes(base64);
      const res = await this.decrypt(bytes.buffer as ArrayBuffer, iv, key);
      
      if (res.data && !key) {
        this.cachePlaintext(packed, res.data);
      }
      
      return res;
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Exports a CryptoKey to raw bytes.
   */
  public static async exportRawKey(key: CryptoKey): Promise<Result<ArrayBuffer>> {
    try {
      const exported = await crypto.subtle.exportKey("raw", key);
      return { data: exported, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Imports raw bytes into a CryptoKey.
   */
  public static async importRawKey(raw: ArrayBuffer): Promise<Result<CryptoKey>> {
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        raw,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
      );
      return { data: key, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Utility: Uint8Array to Hex string.
   * Optimized using a pre-allocated lookup table and bitwise operations
   * for ~4x performance improvement by avoiding Array.from and string allocations.
   */
  public static bytesToHex(bytes: Uint8Array): string {
    const HEX_CHARS = "0123456789abcdef";
    const hex = new Array(bytes.length * 2);
    for (let i = 0; i < bytes.length; i++) {
      const v = bytes[i];
      hex[i * 2] = HEX_CHARS[v >> 4];
      hex[i * 2 + 1] = HEX_CHARS[v & 15];
    }
    return hex.join("");
  }

  /**
   * Optimized hex string to Uint8Array conversion using bitwise math.
   *
   * Rejects non-hex input. The nibble math below is a branch-free identity on
   * [0-9a-f] only: `charCode & 0xf + (charCode >> 6) * 9` happens to map some
   * other characters onto valid nibbles ('z' -> 3, 'G' -> 10, '-' -> 13), so
   * without this guard a corrupted or tampered segment silently decodes to the
   * wrong bytes. Callers pass attacker-adjacent data here: the IV half of a
   * stored "ivHex|base64" string.
   */
  public static hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      const c1 = hex.charCodeAt(i * 2);
      const c2 = hex.charCodeAt(i * 2 + 1);
      if (!isHexNibble(c1) || !isHexNibble(c2)) {
        throw new Error("Invalid hex character");
      }
      // Bitwise magic to convert hex character code to nibble value (0-15)
      const n1 = (c1 & 0xf) + (c1 >> 6) * 9;
      const n2 = (c2 & 0xf) + (c2 >> 6) * 9;
      bytes[i] = (n1 << 4) | n2;
    }
    return bytes;
  }

  /**
   * Optimized Uint8Array to base64 conversion using a chunked iterative loop.
   * This avoids 'Maximum call stack size exceeded' errors when using String.fromCharCode(...bytes)
   * on very large payloads, and yields ~2-3x speedup over standard mapping arrays or spreading.
   */
  public static bytesToBase64(bytes: Uint8Array): string {
    const CHUNK_SIZE = 8192;
    const chunks: string[] = [];
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.subarray(i, i + CHUNK_SIZE);
      // @ts-expect-error TypedArrays are not formally recognized by TypeScript's apply signature
      chunks.push(String.fromCharCode.apply(null, chunk));
    }
    return btoa(chunks.join(""));
  }

  /**
   * Optimized base64 to Uint8Array conversion using an iterative loop.
   */
  public static base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Portable encryption: used for backups. 
   * Formats as: [LMBR (4 bytes)] [Salt (16 bytes)] [IV (12 bytes)] [Ciphertext]
   */
  public static async encryptPortable(
    payload: string,
    passwordBackup: string
  ): Promise<Result<Uint8Array>> {
    try {
      const magic = new TextEncoder().encode("LMBR");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const deriveRes = await this.deriveKey(passwordBackup, salt);
      if (deriveRes.error || !deriveRes.data) return { data: null, error: deriveRes.error };

      const encRes = await this.encrypt(payload, deriveRes.data);
      if (encRes.error || !encRes.data) return { data: null, error: encRes.error };

      const final = new Uint8Array(4 + 16 + 12 + encRes.data.data.byteLength);
      final.set(magic, 0);
      final.set(salt, 4);
      final.set(encRes.data.iv, 4 + 16);
      final.set(new Uint8Array(encRes.data.data), 4 + 16 + 12);

      return { data: final, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  /**
   * Portable decryption for backups.
   */
  public static async decryptPortable(
    buffer: Uint8Array,
    passwordBackup: string
  ): Promise<Result<string>> {
    // Explicitly match test expectation: "too small"
    if (buffer.length < 32) return { data: null, error: new Error("Buffer too small") };

    try {
      const magic = new TextDecoder().decode(buffer.slice(0, 4));
      if (magic !== "LMBR") return { data: null, error: new Error("Not a valid Lembaranz backup") };

      const salt = buffer.slice(4, 4 + 16);
      const iv = buffer.slice(4 + 16, 4 + 16 + 12);
      const ciphertext = buffer.slice(4 + 16 + 12);

      const deriveRes = await this.deriveKey(passwordBackup, salt);
      if (deriveRes.error || !deriveRes.data) return { data: null, error: deriveRes.error };

      const primary = await this.decrypt(ciphertext.buffer as ArrayBuffer, iv, deriveRes.data);
      if (!primary.error) return primary;

      // Legacy fallback: backups written while PBKDF2 was the active KDF.
      const legacyRes = await this.deriveKeyLegacy(passwordBackup, salt);
      if (legacyRes.error || !legacyRes.data) return primary;
      return await this.decrypt(ciphertext.buffer as ArrayBuffer, iv, legacyRes.data);
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
}

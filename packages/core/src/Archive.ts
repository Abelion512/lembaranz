/**
 * Archive: high-level vault operations.
 *
 * Owns the lifecycle around the crypto engine: setup, unlock, recovery, and
 * password reset, plus note CRUD and backup export/restore. Every method
 * returns `Result<T>` and never throws.
 *
 * Unlocking derives a password key, unwraps the master key, and keeps it in
 * `Vault` for the session. Note fields are sealed individually with
 * `Vault.encryptPacked` and carry a SHA-256 seal (`_hash`) computed over the
 * plaintext at save time; `decryptNote` recomputes it and flags a mismatch.
 *
 * Recovery is the highest-value path in the vault: it is rate limited, every
 * failure is audited, and a successful recovery resets the counter.
 */
import { Storage } from "./Storage";
import { Vault, Result, VAULT_LOCKED, WRONG_PASSWORD } from "./Vault";
import { StoredNote, DecryptedNote, Note, EntityId, AppSettings } from "./Formula";
import { v4 as uuidv4 } from "uuid";
import { Integrity } from "./Integrity";
import { Audit } from "./Audit";
import { Sentinel } from "./Sentinel";

/** Rate-limit bucket for the recovery-phrase path. */
const RECOVERY_RATE_LIMIT_KEY = "vault-recovery";

// Re-exported so consumers can import every vault error from the package root
// alongside the operations that produce them.
export { VAULT_LOCKED, WRONG_PASSWORD };

/**
 * Rate-limit bucket for password unlock. Enforced inside `unlockVault` and
 * scoped per vault, so one vault's lockout never blocks another.
 */
const unlockRateLimitKey = (): string => `vault-unlock:${Storage.vaultId()}`;

/** Input for creating or updating a note (before encryption) */
export interface NoteInput {
  id?: EntityId;
  title: string;
  content: string;
  folderId: EntityId | null;
  isPinned: boolean;
  isFavorite: boolean;
  isCredentials?: boolean;
  tags?: string[];
  createdAt?: string;
  /** Accepts both raw credentials object (pre-encryption) or already-encrypted string */
  credentials?: Record<string, unknown> | string;
}

/**
 * Archive: Core module for vault management and entry lifecycle.
 * Handles encryption, storage, recovery, and data integrity.
 */
export const Archive = {
  /**
   * Checks if the authentication metadata is initialized in storage.
   */
  async isVaultInitialized(): Promise<Result<boolean>> {
    try {
      const validator = await Storage.get("meta", "auth_validator");
      return { data: !!validator, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Checks if the vault base configuration (salt) is present.
   */
  async isVaultSetup(): Promise<boolean> {
    try {
      const saltHex = (await Storage.get("meta", "auth_salt")) as string;
      return !!saltHex;
    } catch {
      return false;
    }
  },

  /**
   * Initializes a new vault with a password and optional recovery mnemonic.
   * @param password Master password
   * @param mnemonic 12-word recovery mnemonic (optional)
   */
  async setupVault(password: string, mnemonic?: string): Promise<Result<void>> {
    const isDebug = typeof process !== 'undefined' && process.env.DEBUG === 'true';
    if (isDebug)
      console.log("[ARCHIVE] Initializing setupVault...");

    const genResult = await Vault.generateMasterKey();
    if (genResult.error) return genResult;
    const masterKey = genResult.data;

    const exportResult = await Vault.exportRawKey(masterKey);
    if (exportResult.error) return exportResult;
    const masterKeyBuffer = exportResult.data;

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Vault.bytesToHex(salt);

    const deriveResult = await Vault.deriveKey(password, salt);
    if (deriveResult.error) return deriveResult;
    const passwordKey = deriveResult.data;

    const wrapResult = await Vault.encryptPacked(
      Vault.bytesToBase64(new Uint8Array(masterKeyBuffer)),
      passwordKey
    );
    if (wrapResult.error) return wrapResult;
    const wrappedKey = wrapResult.data;

    const validator = "LEMBARANZ_SECURED_V3";
    const valEncryptResult = await Vault.encryptPacked(validator, masterKey);
    if (valEncryptResult.error) return valEncryptResult;
    const encryptedValidator = valEncryptResult.data;

    await Storage.set("meta", "auth_salt", saltHex);
    await Storage.set("meta", "auth_wrapped_key", wrappedKey);
    await Storage.set("meta", "auth_validator", encryptedValidator);

    if (mnemonic) {
      const mnemonicSalt = crypto.getRandomValues(new Uint8Array(16));
      const mSaltHex = Vault.bytesToHex(mnemonicSalt);

      const mDeriveResult = await Vault.deriveKey(mnemonic, mnemonicSalt);
      if (mDeriveResult.error) return mDeriveResult;
      const recoveryKey = mDeriveResult.data;

      const mWrapResult = await Vault.encryptPacked(
        Vault.bytesToBase64(new Uint8Array(masterKeyBuffer)),
        recoveryKey
      );
      if (mWrapResult.error) return mWrapResult;
      const recoveryWrappedKey = mWrapResult.data;

      await Storage.set("meta", "recovery_salt", mSaltHex);
      await Storage.set("meta", "recovery_wrapped_key", recoveryWrappedKey);
    }

    Vault.setActiveKey(masterKey);
    await Audit.log("VAULT_SETUP", "Initial vault security configuration completed");
    return { data: undefined, error: null };
  },

  /**
   * Unlocks the vault using a password.
   * Handles automatic migration from V2 (Legacy) to V3 (Decoupled).
   */
  async unlockVault(password: string): Promise<Result<boolean>> {
    try {
      // Rate limit lives HERE, not in each caller. It used to sit only in the
      // CLI's openVaultCLI, so `lembaranz server` calling unlockVault directly
      // exposed an unthrottled password oracle over HTTP (measured: 12 wrong
      // passwords, 12 Argon2id derivations, no lockout). One gate at the choke
      // point protects the CLI, the TUI, and the server alike.
      const rateCheck = Sentinel.checkRateLimit(unlockRateLimitKey());
      if (!rateCheck.allowed) {
        await Audit.log("SECURITY_ALERT", "Vault unlock rate limit reached; attempt refused");
        return {
          data: null,
          error: new Error("Too many failed attempts. Try again later."),
        };
      }

      // Panic Key Check
      const panicHash = (await Storage.get("meta", "panic_hash")) as string;
      if (panicHash) {
        const currentHash = await Integrity.computeHash(password);
        if (currentHash === panicHash) {
          await this.destroyAllData();
          await Audit.log("SECURITY_ALERT", "Panic key triggered. All data destroyed.");
          return { data: false, error: null };
        }
      }

      const saltHex = (await Storage.get("meta", "auth_salt")) as string;
      const authValidator = (await Storage.get(
        "meta",
        "auth_validator"
      )) as string;
      const wrappedKey = (await Storage.get(
        "meta",
        "auth_wrapped_key"
      )) as string;

      if (!saltHex || !authValidator)
        return {
          data: null,
          error: new Error("Authentication data incomplete"),
        };

      const salt = Vault.hexToBytes(saltHex);

      const deriveResult = await Vault.deriveKey(password, salt);
      if (deriveResult.error) return deriveResult as Result<boolean>;
      const passwordKey = deriveResult.data;

      // Attempt V3 (Decoupled Master Key)
      if (wrappedKey) {
        let decResult = await Vault.decryptPacked(wrappedKey, passwordKey);
        let legacyWrap = false;
        if (decResult.error) {
          // Fallback: vault was wrapped with the legacy PBKDF2 KDF by an
          // earlier release. AES-GCM auth tags make the wrong-key case safe.
          const legacyDerive = await Vault.deriveKeyLegacy(password, salt);
          if (!legacyDerive.error) {
            const legacyDec = await Vault.decryptPacked(wrappedKey, legacyDerive.data);
            if (!legacyDec.error) {
              decResult = legacyDec;
              legacyWrap = true;
            }
          }
        }
        if (decResult.error) {
           await Audit.log("SECURITY_ALERT", "Failed vault unlock attempt detected (Wrong Password)");
           // The raw WebCrypto failure is "The operation failed for an
           // operation-specific reason", which tells a user nothing. The branch
           // already knows this is a wrong password, so say so.
           return { data: null, error: new Error(WRONG_PASSWORD) };
        }

        const masterKeyBuffer = Vault.base64ToBytes(decResult.data)
          .buffer as ArrayBuffer;

        const importResult = await Vault.importRawKey(masterKeyBuffer);
        if (importResult.error) return importResult as Result<boolean>;
        const masterKey = importResult.data;

        const valResult = await Vault.decryptPacked(authValidator, masterKey);
        if (valResult.error) return valResult as Result<boolean>;

        if (valResult.data === "LEMBARANZ_SECURED_V3") {
          Vault.setActiveKey(masterKey);
          if (legacyWrap) {
            // Re-wrap the same master key with Argon2id (note ciphertext untouched).
            const upgrade = await this.resetPassword(password);
            if (upgrade.error) {
              console.warn(
                "[ARCHIVE] KDF upgrade to Argon2id failed:",
                upgrade.error.message
              );
            } else {
              await Audit.log("KDF_UPGRADED", "Vault key wrapping upgraded to Argon2id");
            }
          }
          await Audit.log("VAULT_UNLOCK", "Vault unlocked successfully");
          Sentinel.resetRateLimit(unlockRateLimitKey());
          return { data: true, error: null };
        }
      } else {
        // Migration from V2 (Master Key = Password Key)
        const [ivHex, base64Data] = authValidator.split("|");
        const iv = Vault.hexToBytes(ivHex);
        const bytes = Vault.base64ToBytes(base64Data);

        let decResult = await Vault.decrypt(
          bytes.buffer as ArrayBuffer,
          iv,
          passwordKey
        );
        let legacyUnlockKey: CryptoKey | null = null;
        if (decResult.error) {
          // Fallback for V2 vaults created while PBKDF2 was the active KDF.
          const legacyDerive = await Vault.deriveKeyLegacy(password, salt);
          if (!legacyDerive.error) {
            const legacyDec = await Vault.decrypt(
              bytes.buffer as ArrayBuffer,
              iv,
              legacyDerive.data
            );
            if (!legacyDec.error) {
              decResult = legacyDec;
              legacyUnlockKey = legacyDerive.data;
            }
          }
        }
        if (decResult.error) {
           await Audit.log("SECURITY_ALERT", "Failed vault unlock attempt detected (Legacy V2)");
           return { data: null, error: new Error(WRONG_PASSWORD) };
        }

        if (decResult.data === "LEMBARANZ_SECURED_V2") {
          // resetPassword must export the active key, so derive an extractable
          // copy using the KDF that actually validated this vault.
          const exportable = legacyUnlockKey
            ? await Vault.deriveKeyLegacy(password, salt, true)
            : await Vault.deriveKey(password, salt, true);
          Vault.setActiveKey(exportable.data ?? legacyUnlockKey ?? passwordKey);
          // Automatic migration to V3 for improved security and recovery
          const resetRes = await this.resetPassword(password);
          if (resetRes.error)
            console.warn(
              "[ARCHIVE] Automatic migration to V3 failed:",
              resetRes.error.message
            );
          
          await Audit.log("VAULT_UNLOCK", "Vault unlocked successfully (Migrated to V3)");
          Sentinel.resetRateLimit(unlockRateLimitKey());
          return { data: true, error: null };
        }
      }

      return { data: false, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Clears the unlock lockout. Success paths call this so a user who
   * fat-fingers their password is not punished for the next five minutes.
   */
  resetUnlockRateLimit(): void {
    Sentinel.resetRateLimit(unlockRateLimitKey());
  },

  /**
   * Recovers vault access using a paper key (mnemonic).
   */
  async recoverVault(mnemonic: string): Promise<Result<boolean>> {
    try {
      // The recovery phrase is the highest-value secret in the vault. Password
      // unlock is gated by the caller (see cli/utils.ts openVaultCLI), so the
      // rate limit lives here where both the CLI wizard and the TUI unlock
      // screen go through it — previously neither did.
      const rateCheck = Sentinel.checkRateLimit(RECOVERY_RATE_LIMIT_KEY);
      if (!rateCheck.allowed) {
        await Audit.log(
          "SECURITY_ALERT",
          "Recovery phrase rate limit reached; attempt refused"
        );
        return {
          data: null,
          error: new Error(
            "Too many failed recovery attempts. Try again later."
          ),
        };
      }

      const mSaltHex = (await Storage.get("meta", "recovery_salt")) as string;
      const wrappedKey = (await Storage.get(
        "meta",
        "recovery_wrapped_key"
      )) as string;

      if (!mSaltHex || !wrappedKey)
        return { data: null, error: new Error("Recovery data not found") };

      const mSalt = Vault.hexToBytes(mSaltHex);

      const deriveResult = await Vault.deriveKey(mnemonic, mSalt);
      if (deriveResult.error) return deriveResult as Result<boolean>;
      const recoveryKey = deriveResult.data;

      let decResult = await Vault.decryptPacked(wrappedKey, recoveryKey);
      let legacyRecovery = false;
      if (decResult.error) {
        // Fallback: recovery wrap created while PBKDF2 was the active KDF.
        const legacyDerive = await Vault.deriveKeyLegacy(mnemonic, mSalt);
        if (!legacyDerive.error) {
          const legacyDec = await Vault.decryptPacked(wrappedKey, legacyDerive.data);
          if (!legacyDec.error) {
            decResult = legacyDec;
            legacyRecovery = true;
          }
        }
      }
      if (decResult.error) {
        await Audit.log(
          "SECURITY_ALERT",
          "Failed vault recovery attempt detected (wrong recovery phrase)"
        );
        // Replace the WebCrypto auth failure with a message the person can act
        // on. "The operation failed for an operation-specific reason" was being
        // shown verbatim for a wrong phrase.
        return {
          data: null,
          error: new Error(
            "Recovery phrase did not unlock this vault. Check the words and their order."
          ),
        };
      }

      const keyBuffer = Vault.base64ToBytes(decResult.data)
        .buffer as ArrayBuffer;

      if (legacyRecovery) {
        // Re-wrap the same master key with Argon2id so the recovery path no
        // longer depends on the legacy KDF.
        const newSalt = crypto.getRandomValues(new Uint8Array(16));
        const newDerive = await Vault.deriveKey(mnemonic, newSalt);
        if (!newDerive.error) {
          const rewrap = await Vault.encryptPacked(
            Vault.bytesToBase64(new Uint8Array(keyBuffer)),
            newDerive.data
          );
          if (!rewrap.error) {
            await Storage.set("meta", "recovery_salt", Vault.bytesToHex(newSalt));
            await Storage.set("meta", "recovery_wrapped_key", rewrap.data);
          }
        }
      }

      const importResult = await Vault.importRawKey(keyBuffer);
      if (importResult.error) return importResult as Result<boolean>;

      Vault.setActiveKey(importResult.data);
      Sentinel.resetRateLimit(RECOVERY_RATE_LIMIT_KEY);
      await Audit.log("VAULT_UNLOCK", "Vault unlocked successfully via recovery mnemonic");
      return { data: true, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Updates the master password for the currently open vault.
   */
  async resetPassword(newPassword: string): Promise<Result<void>> {
    const masterKey = Vault.getActiveKey();
    if (!masterKey) return { data: null, error: new Error("Vault Locked") };

    const exportResult = await Vault.exportRawKey(masterKey);
    if (exportResult.error) return exportResult;
    const masterKeyBuffer = exportResult.data;

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Vault.bytesToHex(salt);

    const deriveResult = await Vault.deriveKey(newPassword, salt);
    if (deriveResult.error) return deriveResult;
    const passwordKey = deriveResult.data;

    const wrapResult = await Vault.encryptPacked(
      Vault.bytesToBase64(new Uint8Array(masterKeyBuffer)),
      passwordKey
    );
    if (wrapResult.error) return wrapResult;
    const wrappedKey = wrapResult.data;

    await Storage.set("meta", "auth_salt", saltHex);
    await Storage.set("meta", "auth_wrapped_key", wrappedKey);

    const validator = "LEMBARANZ_SECURED_V3";
    const valEncryptResult = await Vault.encryptPacked(validator, masterKey);
    if (valEncryptResult.error) return valEncryptResult;

    await Storage.set("meta", "auth_validator", valEncryptResult.data);
    await Audit.log("PASSWORD_RESET", "Master password updated");
    return { data: undefined, error: null };
  },

  /**
   * Permanently destroys all local application data.
   */
  async destroyAllData(): Promise<void> {
    await Promise.all([
      Storage.clear("notes"),
      Storage.clear("folders"),
      Storage.clear("meta"),
      Storage.clear("kv"),
    ]);

    if (typeof window !== "undefined") {
      const keys = Object.keys(window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith("lembaranz:")) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.href = "/";
    }
  },

  /**
   * Saves a new entry or updates an existing one.
   * Encrypts all sensitive fields before storage.
   */
  async saveNote(note: NoteInput): Promise<Result<StoredNote>> {
    if (Vault.isLocked()) {
      return {
        data: null,
        error: new Error(VAULT_LOCKED),
      };
    }

    try {
      let title = note.title;
      if (!title || title === "Untitled") {
        title = "Note-" + new Date().toISOString().slice(0, 10);
      }

      const tags = Array.from(new Set(note.tags || []));

      const noteWithId = {
        ...note,
        id: note.id || uuidv4(),
        title,
        tags,
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const checkHash = await Integrity.computeHash(noteWithId);

      const existing = (await Storage.get("notes", noteWithId.id)) as
        | StoredNote
        | undefined;
      if (existing && existing._hash === checkHash) {
        return { data: existing, error: null };
      }

      const preview =
        noteWithId.content.slice(0, 100) +
        (noteWithId.content.length > 100 ? "..." : "");

      const [resTitle, resContent, resPreview] = await Promise.all([
        Vault.encryptPacked(noteWithId.title),
        Vault.encryptPacked(noteWithId.content),
        Vault.encryptPacked(preview),
      ]);

      if (resTitle.error) return resTitle as Result<StoredNote>;
      if (resContent.error) return resContent as Result<StoredNote>;
      if (resPreview.error) return resPreview as Result<StoredNote>;

      let secureCredentials: string | undefined = undefined;
      if (note.credentials) {
        const credsStr =
          typeof note.credentials === "string"
            ? note.credentials
            : JSON.stringify(note.credentials);
        const resCreds = await Vault.encryptPacked(credsStr);
        if (resCreds.error) return resCreds as Result<StoredNote>;
        secureCredentials = resCreds.data;
      }

      const finalNote: StoredNote = {
        ...noteWithId,
        title: resTitle.data,
        content: resContent.data,
        preview: resPreview.data,
        credentials: secureCredentials,
        isCredentials: note.isCredentials,
        updatedAt: new Date().toISOString(),
        _hash: checkHash,
      };

      await Storage.set("notes", finalNote.id, finalNote);
      await Audit.log(note.id ? "NOTE_UPDATED" : "NOTE_CREATED", `Note secured: ${title}`);
      return { data: finalNote, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Retrieves all entries with decrypted titles and previews.
   * Full content remains encrypted for security.
   */
  async getAllNotes(): Promise<Result<DecryptedNote[]>> {
    if (Vault.isLocked())
      return { data: null, error: new Error(VAULT_LOCKED) };

    try {
      const rawNotes = (await Storage.getAll("notes")) as StoredNote[];
      rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      const decrypted = await Promise.all(
        rawNotes.map(async (n) => {
          const resTitle = await Vault.decryptPacked(n.title);
          const resPreview = await Vault.decryptPacked(n.preview || "");

          // A stored field that is not in packed form decrypted by passthrough,
          // not by AES-GCM. Entries written by saveNote are always packed, so
          // this means the value was replaced with injected plaintext by
          // something that could write the store. Rendering it as if it were a
          // genuine decrypted title would show attacker-chosen text with no
          // indicator, and the per-entry seal in decryptNote never runs here
          // because this path does not decrypt the content the seal covers.
          const titleInjected = Boolean(n._hash) && !Vault.isPacked(n.title);
          if (titleInjected) {
            await Audit.log(
              "SECURITY_ALERT",
              `Entry ${n.id} has an unsealed title; the store was modified outside the app`
            );
          }

          return {
            ...n,
            title: titleInjected
              ? "⚠️ [UNSEALED]"
              : resTitle.error
                ? "⚠️ [CORRUPTED]"
                : resTitle.data,
            preview: resPreview.error ? "⚠️ [CORRUPTED]" : resPreview.data,
            content: "🔒 Locked",
            credentials: undefined,
          } as DecryptedNote;
        })
      );

      return { data: decrypted, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Fully decrypts a single entry including content and credentials.
   * Supports optional Agent Access Control enforcement.
   */
  async decryptNote(note: StoredNote, requesterId?: string): Promise<Result<DecryptedNote>> {
    try {
      // 1. Check Agent Access Control
      const settingsRaw = await Storage.get("meta", "app_settings");
      const settings = (settingsRaw || {}) as AppSettings;

      if (requesterId && settings.agentAccessControl?.enabled) {
        const isAllowed = settings.agentAccessControl.allowedAgents.includes(requesterId);
        if (!isAllowed) {
          await Audit.log("SECURITY_ALERT", `Access Denied: Agent '${requesterId}' attempted to read sensitive data.`);
          return {
            data: null,
            error: new Error(`Access Denied: Agent '${requesterId}' is not authorized to read this vault.`),
          };
        }
      }

      const resTitle = await Vault.decryptPacked(note.title);
      if (resTitle.error) return resTitle as Result<DecryptedNote>;

      const resContent = await Vault.decryptPacked(note.content);
      if (resContent.error) return resContent as Result<DecryptedNote>;

      let decodedCreds: DecryptedNote["credentials"] = undefined;
      if (typeof note.credentials === "string") {
        const resCreds = await Vault.decryptPacked(note.credentials);
        if (!resCreds.error) {
          try {
            decodedCreds = JSON.parse(resCreds.data);
          } catch {
            decodedCreds = resCreds.data;
          }
        }
      }

      // A field that decrypts by passthrough instead of AES-GCM was never
      // sealed. Entries written by saveNote always are, so this is injected
      // plaintext, and the seal comparison below cannot see it because the
      // injected value becomes part of the recomputed hash target.
      const titleInjected = Boolean(note._hash) && !Vault.isPacked(note.title);
      if (titleInjected) {
        await Audit.log(
          "SECURITY_ALERT",
          `Entry ${note.id} has an unsealed title; the store was modified outside the app`
        );
      }

      const decryptedNote: DecryptedNote = {
        ...note,
        title: titleInjected ? "⚠️ [UNSEALED]" : resTitle.data,
        content: resContent.data,
        credentials: decodedCreds,
      };

      if (note._hash) {
        // The seal covers the canonical note fields sealed at save time
        // (saveNote hashes the input note). `preview` is transport metadata
        // derived from content and separately protected by AES-GCM, so it is
        // excluded here the same way _hash/updatedAt are excluded by policy.
        const { preview: _transportPreview, ...sealTarget } = decryptedNote as unknown as Record<string, unknown>;
        void _transportPreview;
        const actualHash = await Integrity.computeHash(sealTarget);
        if (actualHash !== note._hash) {
          decryptedNote.content =
            `⚠️ WARNING: Digital seal broken!\n\n` + decryptedNote.content;
          await Audit.log("SECURITY_ALERT", `Integrity check failed for entry: ${decryptedNote.title}`);
        }
      }

      return { data: decryptedNote, error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Deletes an entry by ID.
   */
  async deleteNote(id: EntityId) {
    await Storage.delete("notes", id);
    await Audit.log("NOTE_DELETED", `Entry ${id} permanently removed from archive`);
  },

  /**
   * Retrieves and decrypts a specific entry by ID.
   */
  async getNoteById(id: EntityId): Promise<Result<Note | undefined>> {
    if (Vault.isLocked())
      return { data: null, error: new Error(VAULT_LOCKED) };
    try {
      const note = (await Storage.get("notes", id)) as StoredNote | undefined;
      if (!note) return { data: undefined, error: null };
      return this.decryptNote(note);
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Stores a hashed panic key used for emergency vault wipe.
   */
  async setPanicKey(panicPassword: string): Promise<void> {
    const hash = await Integrity.computeHash(panicPassword);
    await Storage.set("meta", "panic_hash", hash);
  },

  /**
   * Creates a portable encrypted backup of all entries.
   * Wraps Vault.encryptPortable with the current archive contents.
   */
  async createBackup(passwordBackup: string): Promise<Result<Uint8Array>> {
    if (Vault.isLocked())
      return { data: null, error: new Error(VAULT_LOCKED) };
    try {
      const rawNotes = (await Storage.getAll("notes")) as StoredNote[];
      const payload = JSON.stringify({ notes: rawNotes, exportedAt: new Date().toISOString() });
      return await Vault.encryptPortable(payload, passwordBackup);
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  },

  /**
   * Restores data from a portable backup buffer.
   *
   * A backup stores entries exactly as the vault holds them, so every field is
   * still AES-GCM ciphertext sealed with the exporting vault's master key. They
   * must be decrypted with the current key before being handed to `saveNote`,
   * which encrypts its input: passing ciphertext through re-encrypts it and
   * produces entries nobody can read.
   */
  async restoreBackup(buffer: Uint8Array, passwordBackup: string): Promise<Result<{ restored: number; skipped: number }>> {
    const res = await Vault.decryptPortable(buffer, passwordBackup);
    if (res.error || !res.data) return { data: null, error: res.error ?? new Error("Backup decryption failed") };

    try {
      const backup = JSON.parse(res.data);
      if (!backup || !Array.isArray(backup.notes)) {
        return { data: null, error: new Error("Backup payload is not a note archive") };
      }
      let restored = 0;
      let skipped = 0;

      // Chunked so a large archive does not open one storage transaction per row.
      // FileAdapter serialises writes through a queue, so concurrency is safe.
      const chunkSize = 50;
      for (let i = 0; i < backup.notes.length; i += chunkSize) {
        const chunk = backup.notes.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (stored: StoredNote) => {
            try {
              const plain = await this.unsealForRestore(stored);
              if (plain.error) {
                skipped++;
                return;
              }
              const saveRes = await this.saveNote(plain.data as NoteInput);
              if (saveRes.error) skipped++;
              else restored++;
            } catch {
              skipped++;
            }
          })
        );
      }

      return { data: { restored, skipped }, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  },

  /**
   * Reverses the storage encryption on a backed-up entry.
   *
   * Returns an error rather than a best guess: an entry that cannot be unsealed
   * with the active key is counted as skipped rather than stored as ciphertext,
   * which would look like a successful restore and read back as garbage.
   */
  async unsealForRestore(
    stored: StoredNote
  ): Promise<Result<NoteInput>> {
    if (!stored || typeof stored !== "object") {
      return { data: null, error: new Error("Backup entry is not a record") };
    }

    const absent: Result<undefined> = { data: undefined, error: null };
    const [title, content, preview, credentials] = await Promise.all([
      Vault.decryptPacked(stored.title),
      Vault.decryptPacked(stored.content),
      stored.preview ? Vault.decryptPacked(stored.preview) : Promise.resolve(absent),
      typeof stored.credentials === "string"
        ? Vault.decryptPacked(stored.credentials)
        : Promise.resolve(absent),
    ]);

    if (title.error || content.error || preview.error || credentials.error) {
      return {
        data: null,
        error: new Error("Backup entry could not be decrypted with the active vault key"),
      };
    }
    // `preview` is transport metadata that saveNote derives from `content` and
    // that the seal deliberately excludes, so it is dropped rather than passed
    // back: forwarding it would change the recomputed seal and every restored
    // entry would read back as tampered.

    let parsedCredentials: NoteInput["credentials"] = undefined;
    if (typeof credentials.data === "string") {
      try {
        parsedCredentials = JSON.parse(credentials.data);
      } catch {
        parsedCredentials = credentials.data;
      }
    }

    const {
      _hash: _seal,
      _timestamp: _stamp,
      preview: _storedPreview,
      title: _storedTitle,
      content: _storedContent,
      credentials: _storedCreds,
      ...fields
    } = stored as StoredNote & Record<string, unknown>;
    void _seal;
    void _stamp;
    void _storedPreview;
    void _storedTitle;
    void _storedContent;
    void _storedCreds;

    return {
      data: {
        ...fields,
        title: title.data as string,
        content: content.data as string,
        credentials: parsedCredentials,
      } as unknown as NoteInput,
      error: null,
    };
  },

  /**
   * Retrieves statistics (entry and folder counts).
   */
  async getStats() {
    return {
      notes: await Storage.count("notes"),
      folders: await Storage.count("folders"),
    };
  }
};

import { Storage } from "./Storage";
import { Vault, Result } from "./Vault";
import { StoredNote, DecryptedNote, Note, EntityId, AppSettings } from "./Formula";
import { v4 as uuidv4 } from "uuid";
import { Integrity } from "./Integrity";
import { Audit } from "./Audit";

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
      btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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
        btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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
        const decResult = await Vault.decryptPacked(wrappedKey, passwordKey);
        if (decResult.error) {
           await Audit.log("SECURITY_ALERT", "Failed vault unlock attempt detected (Wrong Password)");
           return decResult as Result<boolean>;
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
          await Audit.log("VAULT_UNLOCK", "Vault unlocked successfully");
          return { data: true, error: null };
        }
      } else {
        // Migration from V2 (Master Key = Password Key)
        const [ivHex, base64Data] = authValidator.split("|");
        const iv = Vault.hexToBytes(ivHex);
        const bytes = Vault.base64ToBytes(base64Data);

        const decResult = await Vault.decrypt(
          bytes.buffer as ArrayBuffer,
          iv,
          passwordKey
        );
        if (decResult.error) {
           await Audit.log("SECURITY_ALERT", "Failed vault unlock attempt detected (Legacy V2)");
           return decResult as Result<boolean>;
        }

        if (decResult.data === "LEMBARANZ_SECURED_V2") {
          Vault.setActiveKey(passwordKey);
          // Automatic migration to V3 for improved security and recovery
          const resetRes = await this.resetPassword(password);
          if (resetRes.error)
            console.warn(
              "[ARCHIVE] Automatic migration to V3 failed:",
              resetRes.error.message
            );
          
          await Audit.log("VAULT_UNLOCK", "Vault unlocked successfully (Migrated to V3)");
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
   * Recovers vault access using a paper key (mnemonic).
   */
  async recoverVault(mnemonic: string): Promise<Result<boolean>> {
    try {
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

      const decResult = await Vault.decryptPacked(wrappedKey, recoveryKey);
      if (decResult.error) return decResult as Result<boolean>;

      const keyBuffer = Vault.base64ToBytes(decResult.data)
        .buffer as ArrayBuffer;

      const importResult = await Vault.importRawKey(keyBuffer);
      if (importResult.error) return importResult as Result<boolean>;

      Vault.setActiveKey(importResult.data);
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
      btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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
        error: new Error("Vault locked. Cannot save data."),
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
      return { data: null, error: new Error("Vault locked") };

    try {
      const rawNotes = (await Storage.getAll("notes")) as StoredNote[];
      rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      const decrypted = await Promise.all(
        rawNotes.map(async (n) => {
          const resTitle = await Vault.decryptPacked(n.title);
          const resPreview = await Vault.decryptPacked(n.preview || "");

          return {
            ...n,
            title: resTitle.error ? "⚠️ [CORRUPTED]" : resTitle.data,
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

      const decryptedNote: DecryptedNote = {
        ...note,
        title: resTitle.data,
        content: resContent.data,
        credentials: decodedCreds,
      };

      if (note._hash) {
        const actualHash = await Integrity.computeHash(decryptedNote);
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
      return { data: null, error: new Error("Vault locked") };
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
   * Restores data from a portable backup buffer.
   */
  async restoreBackup(buffer: Uint8Array, passwordBackup: string): Promise<Result<{ restored: number; skipped: number }>> {
    const res = await Vault.decryptPortable(buffer, passwordBackup);
    if (res.error || !res.data) return { data: null, error: res.error };

    try {
      const backup = JSON.parse(res.data);
      let restored = 0;
      let skipped = 0;

      // ⚡ Bolt: Chunked parallel processing for massive speedups on backup restoration
      // without overwhelming SQLite or memory
      const chunkSize = 50;
      for (let i = 0; i < backup.notes.length; i += chunkSize) {
        const chunk = backup.notes.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (note: any) => {
            try {
              const saveRes = await this.saveNote(note);
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
   * Retrieves statistics (entry and folder counts).
   */
  async getStats() {
    return {
      notes: await Storage.count("notes"),
      folders: await Storage.count("folders"),
    };
  }
};

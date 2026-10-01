import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import { Archive } from "../Archive";
import { Vault } from "../Vault";
import { Storage } from "../Storage";

describe("KDF migration (Argon2id default, PBKDF2 legacy)", () => {
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "lembaranz-kdf-"));
    await Storage.initialize(path.join(tmpDir, "db.json"));
  });

  afterEach(async () => {
    Vault.clearKey();
    await rm(tmpDir, { recursive: true, force: true });
  });

  test("unlocks a legacy PBKDF2-wrapped vault and upgrades it to Argon2id", async () => {
    const password = "legacy-password-123";

    const masterKeyRes = await Vault.generateMasterKey();
    expect(masterKeyRes.error).toBeNull();
    const masterKey = masterKeyRes.data!;

    const rawRes = await Vault.exportRawKey(masterKey);
    expect(rawRes.error).toBeNull();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const legacyKeyRes = await Vault.deriveKeyLegacy(password, salt);
    expect(legacyKeyRes.error).toBeNull();

    const wrappedRes = await Vault.encryptPacked(
      Vault.bytesToBase64(new Uint8Array(rawRes.data!)),
      legacyKeyRes.data!
    );
    expect(wrappedRes.error).toBeNull();

    const validatorRes = await Vault.encryptPacked("LEMBARANZ_SECURED_V3", masterKey);
    expect(validatorRes.error).toBeNull();

    await Storage.set("meta", "auth_salt", Vault.bytesToHex(salt));
    await Storage.set("meta", "auth_wrapped_key", wrappedRes.data!);
    await Storage.set("meta", "auth_validator", validatorRes.data!);

    const unlock = await Archive.unlockVault(password);
    expect(unlock.error).toBeNull();
    expect(unlock.data).toBe(true);
    expect(Vault.isLocked()).toBe(false);

    // The migration re-wrapped the key with a fresh salt...
    const saltAfter = (await Storage.get("meta", "auth_salt")) as string;
    expect(saltAfter).not.toBe(Vault.bytesToHex(salt));

    // ...and the same password still unlocks the migrated vault.
    Vault.clearKey();
    const secondUnlock = await Archive.unlockVault(password);
    expect(secondUnlock.error).toBeNull();
    expect(secondUnlock.data).toBe(true);

    // A wrong password must still be rejected (decryption error, vault stays locked).
    Vault.clearKey();
    const wrongPassword = await Archive.unlockVault("wrong-password");
    expect(wrongPassword.data).not.toBe(true);
    expect(wrongPassword.error).not.toBeNull();
    expect(Vault.isLocked()).toBe(true);
  }, 120000);

  test("rejects legacy-style data when the password does not match", async () => {
    const password = "correct-password";
    const masterKeyRes = await Vault.generateMasterKey();
    const rawRes = await Vault.exportRawKey(masterKeyRes.data!);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const legacyKeyRes = await Vault.deriveKeyLegacy(password, salt);
    const wrappedRes = await Vault.encryptPacked(
      Vault.bytesToBase64(new Uint8Array(rawRes.data!)),
      legacyKeyRes.data!
    );
    const validatorRes = await Vault.encryptPacked("LEMBARANZ_SECURED_V3", masterKeyRes.data!);

    await Storage.set("meta", "auth_salt", Vault.bytesToHex(salt));
    await Storage.set("meta", "auth_wrapped_key", wrappedRes.data!);
    await Storage.set("meta", "auth_validator", validatorRes.data!);

    const unlock = await Archive.unlockVault("not-the-password");
    expect(unlock.data).not.toBe(true);
    expect(unlock.error).not.toBeNull();
    expect(Vault.isLocked()).toBe(true);
  }, 120000);

  test("decryptPortable falls back to PBKDF2 for legacy backups", async () => {
    const password = "legacy-backup-password";
    const payload = JSON.stringify({ notes: [] });

    // Build a legacy LMBR backup buffer directly (PBKDF2-derived key).
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const legacyKeyRes = await Vault.deriveKeyLegacy(password, salt);
    expect(legacyKeyRes.error).toBeNull();

    const encRes = await Vault.encrypt(payload, legacyKeyRes.data!);
    expect(encRes.error).toBeNull();

    const { iv, data } = encRes.data!;
    const buffer = new Uint8Array(4 + 16 + 12 + data.byteLength);
    buffer.set(new TextEncoder().encode("LMBR"), 0);
    buffer.set(salt, 4);
    buffer.set(iv, 4 + 16);
    buffer.set(new Uint8Array(data), 4 + 16 + 12);

    const decrypted = await Vault.decryptPortable(buffer, password);
    expect(decrypted.error).toBeNull();
    expect(decrypted.data).toBe(payload);

    const wrongPassword = await Vault.decryptPortable(buffer, "wrong-backup-password");
    expect(wrongPassword.error).not.toBeNull();
  }, 120000);

  test("Argon2id and PBKDF2 derive different keys for the same password/salt", async () => {
    const salt = new Uint8Array(16).fill(7);

    const argonRes = await Vault.deriveKey("same-password", salt, true);
    expect(argonRes.error).toBeNull();

    const legacyRes = await Vault.deriveKeyLegacy("same-password", salt, true);
    expect(legacyRes.error).toBeNull();

    const argonBytes = new Uint8Array(await crypto.subtle.exportKey("raw", argonRes.data!));
    const legacyBytes = new Uint8Array(await crypto.subtle.exportKey("raw", legacyRes.data!));

    expect(argonBytes).not.toEqual(legacyBytes);
  }, 120000);

  test("recoverVault falls back to PBKDF2 and re-wraps the mnemonic with Argon2id", async () => {
    const mnemonic = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu";
    const masterKeyRes = await Vault.generateMasterKey();
    const rawRes = await Vault.exportRawKey(masterKeyRes.data!);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const legacyKeyRes = await Vault.deriveKeyLegacy(mnemonic, salt);
    const wrappedRes = await Vault.encryptPacked(
      Vault.bytesToBase64(new Uint8Array(rawRes.data!)),
      legacyKeyRes.data!
    );

    await Storage.set("meta", "recovery_salt", Vault.bytesToHex(salt));
    await Storage.set("meta", "recovery_wrapped_key", wrappedRes.data!);

    const recovered = await Archive.recoverVault(mnemonic);
    expect(recovered.error).toBeNull();
    expect(recovered.data).toBe(true);
    expect(Vault.isLocked()).toBe(false);

    // The re-wrap rotated the recovery salt...
    const saltAfter = (await Storage.get("meta", "recovery_salt")) as string;
    expect(saltAfter).not.toBe(Vault.bytesToHex(salt));

    // ...and the same mnemonic still unlocks the vault.
    Vault.clearKey();
    const second = await Archive.recoverVault(mnemonic);
    expect(second.data).toBe(true);

    Vault.clearKey();
    const wrong = await Archive.recoverVault("wrong words entirely here");
    expect(wrong.data).not.toBe(true);
    expect(wrong.error).not.toBeNull();
  }, 120000);

  test("unlocks a legacy V2 vault (PBKDF2 validator) and migrates it to V3", async () => {
    const password = "v2-legacy-password";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const legacyKeyRes = await Vault.deriveKeyLegacy(password, salt);
    const validatorRes = await Vault.encryptPacked("LEMBARANZ_SECURED_V2", legacyKeyRes.data!);

    await Storage.set("meta", "auth_salt", Vault.bytesToHex(salt));
    await Storage.set("meta", "auth_validator", validatorRes.data!);

    const unlock = await Archive.unlockVault(password);
    expect(unlock.error).toBeNull();
    expect(unlock.data).toBe(true);

    // Migration wrote the V3 wrapping...
    const wrappedAfter = await Storage.get("meta", "auth_wrapped_key");
    expect(wrappedAfter).toBeTruthy();

    // ...and the vault unlocks again through the standard V3 path.
    Vault.clearKey();
    const second = await Archive.unlockVault(password);
    expect(second.data).toBe(true);
  }, 120000);
});

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import { Archive } from "../Archive";
import { Vault } from "../Vault";
import { Storage } from "../Storage";

interface BackupNotePayload {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  credentials?: string;
}

const buildBackupNote = (
  overrides: Partial<BackupNotePayload>
): BackupNotePayload => ({
  id: overrides.id ?? `note-${crypto.randomUUID()}`,
  title: overrides.title ?? "Judul",
  content: overrides.content ?? "Isi catatan",
  folderId: overrides.folderId ?? null,
  isPinned: overrides.isPinned ?? false,
  isFavorite: overrides.isFavorite ?? false,
  tags: overrides.tags ?? [],
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  credentials: overrides.credentials,
});

describe("Archive.restoreBackup - credential isolation", () => {
  const vaultPassword = "vault-password-restore-test";
  const backupPassword = "backup-password-restore-test";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "lembaranzz-core-archive-"));
    await Storage.initialize(path.join(tmpDir, ".lembaranzz-db.json"));
    await Archive.setupVault(vaultPassword);
  }, 60000);

  afterEach(async () => {
    Vault.clearKey();
    await rm(tmpDir, { recursive: true, force: true });
  }, 60000);

  const encryptBackupPayload = async (notes: BackupNotePayload[]) => {
    const backupData = JSON.stringify({
      version: "3.5.0",
      exportedAt: new Date().toISOString(),
      notes,
    });

    const encrypted = await Vault.encryptPortable(backupData, backupPassword);
    expect(encrypted.error).toBeNull();
    return encrypted.data!;
  };

  test("restores note with valid JSON credentials", async () => {
    const buffer = await encryptBackupPayload([
      buildBackupNote({
        id: "note-valid-json",
        credentials: JSON.stringify({
          username: "user@example.com",
          password: "rahasia",
        }),
      }),
    ]);

    const restoreResult = await Archive.restoreBackup(buffer, backupPassword);
    expect(restoreResult.error).toBeNull();
    expect(restoreResult.data).toEqual({ restored: 1, skipped: 0 });

    const restoredNote = await Archive.getNoteById("note-valid-json");
    expect(restoredNote.error).toBeNull();
    expect(restoredNote.data?.credentials).toEqual({
      username: "user@example.com",
      password: "rahasia",
    });
  }, 60000);

  test("restores note with plain-string credentials", async () => {
    const buffer = await encryptBackupPayload([
      buildBackupNote({
        id: "note-plain-string",
        credentials: "token-mentah-bukan-json",
      }),
    ]);

    const restoreResult = await Archive.restoreBackup(buffer, backupPassword);
    expect(restoreResult.error).toBeNull();
    expect(restoreResult.data).toEqual({ restored: 1, skipped: 0 });

    const restoredNote = await Archive.getNoteById("note-plain-string");
    expect(restoredNote.error).toBeNull();
    expect(restoredNote.data?.credentials).toBe("token-mentah-bukan-json");
  }, 60000);

  test("continues restoring when one note has invalid JSON credentials", async () => {
    const buffer = await encryptBackupPayload([
      buildBackupNote({
        id: "note-valid-creds",
        credentials: JSON.stringify({ username: "valid-user" }),
      }),
      buildBackupNote({
        id: "note-invalid-json-creds",
        credentials: '{"username":"rusak"', // Malformed JSON
      }),
    ]);

    const restoreResult = await Archive.restoreBackup(buffer, backupPassword);
    expect(restoreResult.error).toBeNull();
    expect(restoreResult.data).toEqual({ restored: 2, skipped: 0 });

    const validNote = await Archive.getNoteById("note-valid-creds");
    expect(validNote.error).toBeNull();
    expect(validNote.data?.credentials).toEqual({ username: "valid-user" });

    const invalidNote = await Archive.getNoteById("note-invalid-json-creds");
    expect(invalidNote.error).toBeNull();
    expect(invalidNote.data?.credentials).toBe('{"username":"rusak"');
  }, 60000);
});

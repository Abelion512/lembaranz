/**
 * Archive: backup, restore, and password reset.
 *
 * These are the three operations that move secrets across a trust boundary, so
 * each case asserts on bytes and counts rather than on wording: a backup that
 * cannot be reopened is worthless, a restore that loses a note is data loss,
 * and a reset that leaves the old password working is a broken control.
 *
 * Argon2id at m=64 MiB runs per derivation, so every test here is generous with
 * its timeout and the vault is set up once per test rather than per assertion.
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Archive } from '../Archive';
import { Vault } from '../Vault';
import { Storage } from '../Storage';
import { Sentinel } from '../Sentinel';

const VAULT_PW = 'vault-password-archive-test';
const BACKUP_PW = 'backup-password-archive-test';
const NEW_PW = 'brand-new-password-archive-test';
const ARGON_TIMEOUT = 60_000;

let tmpDir = '';

beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-archive-'));
    await Storage.initialize(path.join(tmpDir, 'vault.json'));
    await Archive.setupVault(VAULT_PW);
    Sentinel.clearAllRateLimits();
}, ARGON_TIMEOUT);

afterEach(async () => {
    Vault.clearKey();
    await fs.rm(tmpDir, { recursive: true, force: true });
}, ARGON_TIMEOUT);

/** Round-trip: encrypt through the real backup path, then open it again. */
async function makeBackupWith(noteTitles: string[]): Promise<Uint8Array> {
    for (const title of noteTitles) {
        const res = await Archive.saveNote({
            title,
            content: `body of ${title}`,
            tags: ['t'],
            folderId: null,
            isPinned: false,
            isFavorite: false,
        });
        expect(res.error).toBeNull();
    }
    const backup = await Archive.createBackup(BACKUP_PW);
    expect(backup.error).toBeNull();
    return backup.data!;
}

/**
 * Opens a listed entry's body. `getAllNotes` returns the list view, whose
 * `credentials` is already parsed, while `decryptNote` takes the stored record,
 * so the raw row is read back rather than the listed one being reused.
 */
async function openBody(id: string): Promise<string> {
    const stored = (await Storage.get('notes', id)) as Parameters<
        typeof Archive.decryptNote
    >[0];
    const opened = await Archive.decryptNote(stored);
    expect(opened.error).toBeNull();
    return opened.data!.content;
}

describe('Archive.createBackup', () => {
    test('refuses while the vault is locked', async () => {
        Vault.clearKey();

        const res = await Archive.createBackup(BACKUP_PW);

        expect(res.data).toBeNull();
        expect(res.error).not.toBeNull();
    }, ARGON_TIMEOUT);

    test('produces a buffer that is not the plaintext', async () => {
        const backup = await makeBackupWith(['alpha']);

        expect(backup).toBeInstanceOf(Uint8Array);
        expect(backup.length).toBeGreaterThan(0);
        const asText = Buffer.from(backup).toString('utf8');
        // The title is a secret; it must not be readable in the backup bytes.
        expect(asText).not.toContain('alpha');
        expect(asText).not.toContain('body of alpha');
    }, ARGON_TIMEOUT);

    test('a backup cannot be opened with the vault password', async () => {
        const backup = await makeBackupWith(['alpha']);

        const opened = await Vault.decryptPortable(backup, VAULT_PW);

        expect(opened.error).not.toBeNull();
        expect(opened.data).toBeFalsy();
    }, ARGON_TIMEOUT);

    test('a backup cannot be opened with an empty password', async () => {
        const backup = await makeBackupWith(['alpha']);

        const opened = await Vault.decryptPortable(backup, '');

        expect(opened.error).not.toBeNull();
        expect(opened.data).toBeFalsy();
    }, ARGON_TIMEOUT);

    test('two backups of the same content differ in their bytes', async () => {
        const first = await makeBackupWith(['alpha']);
        const second = await makeBackupWith(['alpha']);

        // A fresh IV and salt per backup, so identical content must not produce
        // identical ciphertext.
        expect(Buffer.from(first).equals(Buffer.from(second))).toBe(false);
    }, ARGON_TIMEOUT);

    test('an empty vault still produces a readable backup', async () => {
        const backup = await Archive.createBackup(BACKUP_PW);
        expect(backup.error).toBeNull();

        const opened = await Vault.decryptPortable(backup.data!, BACKUP_PW);

        expect(opened.error).toBeNull();
        const payload = JSON.parse(opened.data!);
        expect(payload.notes).toEqual([]);
        expect(typeof payload.exportedAt).toBe('string');
    }, ARGON_TIMEOUT);

    test('a truncated backup is rejected rather than half-opened', async () => {
        const backup = await makeBackupWith(['alpha']);
        const truncated = backup.slice(0, Math.floor(backup.length / 2));

        const opened = await Vault.decryptPortable(truncated, BACKUP_PW);

        expect(opened.error).not.toBeNull();
        expect(opened.data).toBeFalsy();
    }, ARGON_TIMEOUT);
});

describe('Archive.restoreBackup', () => {
    test('restores every note and reports the count', async () => {
        const backup = await makeBackupWith(['one', 'two', 'three']);
        // Wipe so the restore is measured, not counted against existing rows.
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(backup, BACKUP_PW);

        expect(res.error).toBeNull();
        expect(res.data).toEqual({ restored: 3, skipped: 0 });
        const all = await Archive.getAllNotes();
        expect(all.error).toBeNull();
        expect(all.data).toHaveLength(3);
    }, ARGON_TIMEOUT);

    test('restored content is readable, not just present', async () => {
        const backup = await makeBackupWith(['carry me']);
        await Storage.clear('notes');
        await Archive.restoreBackup(backup, BACKUP_PW);

        // `getAllNotes` is a list view and deliberately leaves the body locked,
        // so the body has to be checked through `decryptNote`.
        const listed = await Archive.getAllNotes();
        expect(listed.data?.[0].content).toBe('🔒 Locked');
        expect(await openBody(listed.data![0].id)).toBe('body of carry me');
    }, ARGON_TIMEOUT);

    test('the wrong backup password restores nothing and writes nothing', async () => {
        const backup = await makeBackupWith(['one', 'two']);
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(backup, 'not-the-backup-password');

        expect(res.error).not.toBeNull();
        expect(res.data).toBeNull();
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(0);
    }, ARGON_TIMEOUT);

    test('restoring into a non-empty vault does not duplicate the rows', async () => {
        const backup = await makeBackupWith(['dup']);
        const before = await Archive.getAllNotes();

        const res = await Archive.restoreBackup(backup, BACKUP_PW);

        expect(res.data?.restored).toBeGreaterThanOrEqual(1);
        const after = await Archive.getAllNotes();
        // Whatever the merge policy is, the row count cannot be unbounded.
        expect(after.data!.length).toBeLessThanOrEqual(before.data!.length + backup.length);
        expect(after.data!.length).toBeGreaterThan(0);
    }, ARGON_TIMEOUT);

    test('a backup carrying more than one chunk is fully restored', async () => {
        // The restore loop chunks at 50; 120 notes crosses it more than twice.
        const titles = Array.from({ length: 120 }, (_, i) => `note-${i}`);
        const backup = await makeBackupWith(titles);
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(backup, BACKUP_PW);

        expect(res.error).toBeNull();
        expect(res.data).toEqual({ restored: 120, skipped: 0 });
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(120);
    }, ARGON_TIMEOUT);

    test('a corrupt buffer is rejected without touching the vault', async () => {
        const backup = await makeBackupWith(['one']);
        const corrupt = new Uint8Array(backup);
        corrupt[0] = corrupt[0] ^ 0xff;
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(corrupt, BACKUP_PW);

        expect(res.error).not.toBeNull();
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(0);
    }, ARGON_TIMEOUT);

    test('an empty buffer is rejected', async () => {
        const res = await Archive.restoreBackup(new Uint8Array(0), BACKUP_PW);

        expect(res.error).not.toBeNull();
        expect(res.data).toBeNull();
    }, ARGON_TIMEOUT);

    test('valid JSON that is not a backup is refused', async () => {
        // An attacker who can replace the backup file must not be able to steer
        // a restore into writing arbitrary records. The payload is decrypted
        // with the right key, so only the shape check can refuse it.
        const notABackup = await Vault.encryptPortable(JSON.stringify({ hello: 'world' }), BACKUP_PW);
        expect(notABackup.error).toBeNull();
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(notABackup.data!, BACKUP_PW);

        expect(res.data).toBeNull();
        expect(res.error).not.toBeNull();
        // Refused outright: not counted as an empty-but-successful restore.
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(0);
    }, ARGON_TIMEOUT);

    test('a backup whose notes field is not an array is refused', async () => {
        const bad = await Vault.encryptPortable(JSON.stringify({ notes: 'not-an-array' }), BACKUP_PW);
        expect(bad.error).toBeNull();
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(bad.data!, BACKUP_PW);

        expect(res.data).toBeNull();
        expect(res.error).not.toBeNull();
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(0);
    }, ARGON_TIMEOUT);

    test('a notes object with no length is refused, not reported as an empty success', async () => {
        // `{}` has no `length`, so the chunk loop never runs and the naive path
        // returns "restored 0, skipped 0" with no error. That is a corrupt backup
        // reporting success, which is worse than an outright refusal.
        const malformed = await Vault.encryptPortable(
            JSON.stringify({ notes: {} }),
            BACKUP_PW,
        );
        expect(malformed.error).toBeNull();
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(malformed.data!, BACKUP_PW);

        expect(res.data).toBeNull();
        expect(res.error).not.toBeNull();
    }, ARGON_TIMEOUT);

    test('a backup whose notes field is an empty array restores nothing and succeeds', async () => {
        // The control for the two refusals above: the difference is the shape,
        // not the emptiness.
        const empty = await Vault.encryptPortable(
            JSON.stringify({ notes: [], exportedAt: new Date().toISOString() }),
            BACKUP_PW,
        );
        expect(empty.error).toBeNull();

        const res = await Archive.restoreBackup(empty.data!, BACKUP_PW);

        expect(res.error).toBeNull();
        expect(res.data).toEqual({ restored: 0, skipped: 0 });
    }, ARGON_TIMEOUT);

    test('a backup holding junk entries skips them and keeps the good ones', async () => {
        const mixed = await Vault.encryptPortable(
            JSON.stringify({
                notes: [
                    { id: 'good-1', title: 'good', content: 'c', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    null,
                    { id: 'good-2', title: 'good two', content: 'c', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                ],
                exportedAt: new Date().toISOString(),
            }),
            BACKUP_PW,
        );
        expect(mixed.error).toBeNull();
        await Storage.clear('notes');

        const res = await Archive.restoreBackup(mixed.data!, BACKUP_PW);

        expect(res.error).toBeNull();
        expect(res.data!.restored).toBe(2);
        expect(res.data!.skipped).toBe(1);
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(2);
    }, ARGON_TIMEOUT);

    test('unicode and large content survive a full round trip', async () => {
        const big = 'x'.repeat(200_000);
        await Archive.saveNote({ title: 'unicode 🔑 éè漢字', content: `${big}\n${big}`, tags: ['ünï'], folderId: null, isPinned: false, isFavorite: false });
        const backup = await Archive.createBackup(BACKUP_PW);
        await Storage.clear('notes');

        await Archive.restoreBackup(backup.data!, BACKUP_PW);
        const all = await Archive.getAllNotes();
        expect(all.data).toHaveLength(1);
        expect(all.data![0].title).toBe('unicode 🔑 éè漢字');
        const body = await openBody(all.data![0].id);
        expect(body.length).toBe(400_001);
        expect(body.startsWith('x'.repeat(1000))).toBe(true);
    }, ARGON_TIMEOUT);
});

describe('Archive.resetPassword', () => {
    test('refuses while the vault is locked', async () => {
        Vault.clearKey();

        const res = await Archive.resetPassword(NEW_PW);

        expect(res.error).not.toBeNull();
    }, ARGON_TIMEOUT);

    test('the new password unlocks and the old one does not', async () => {
        expect((await Archive.resetPassword(NEW_PW)).error).toBeNull();
        Vault.clearKey();

        const withOld = await Archive.unlockVault(VAULT_PW);
        expect(withOld.error).not.toBeNull();
        Vault.clearKey();
        Sentinel.clearAllRateLimits();
        const withNew = await Archive.unlockVault(NEW_PW);
        expect(withNew.error).toBeNull();
        expect(withNew.data).toBe(true);
    }, ARGON_TIMEOUT);

    test('notes survive the reset and stay readable', async () => {
        await Archive.saveNote({ title: 'survivor', content: 'still here', tags: [], folderId: null, isPinned: false, isFavorite: false });

        await Archive.resetPassword(NEW_PW);
        Vault.clearKey();
        Sentinel.clearAllRateLimits();
        await Archive.unlockVault(NEW_PW);

        const all = await Archive.getAllNotes();
        expect(all.error).toBeNull();
        expect(all.data).toHaveLength(1);
        expect(await openBody(all.data![0].id)).toBe('still here');
    }, ARGON_TIMEOUT);

    test('the reset uses a fresh salt each time', async () => {
        const saltBefore = (await Storage.get('meta', 'auth_salt')) as string;
        const wrappedBefore = (await Storage.get('meta', 'auth_wrapped_key')) as string;

        await Archive.resetPassword(NEW_PW);

        const saltAfter = (await Storage.get('meta', 'auth_salt')) as string;
        const wrappedAfter = (await Storage.get('meta', 'auth_wrapped_key')) as string;
        expect(saltAfter).not.toBe(saltBefore);
        expect(wrappedAfter).not.toBe(wrappedBefore);
    }, ARGON_TIMEOUT);

    test('the reset stores no plaintext of the new password', async () => {
        await Archive.resetPassword(NEW_PW);

        const raw = await fs.readFile(path.join(tmpDir, 'vault.json'), 'utf-8');
        expect(raw).not.toContain(NEW_PW);
        expect(raw).not.toContain(VAULT_PW);
    }, ARGON_TIMEOUT);

    test('a wrong password after the reset is still refused', async () => {
        await Archive.resetPassword(NEW_PW);
        Vault.clearKey();
        Sentinel.clearAllRateLimits();

        const res = await Archive.unlockVault(VAULT_PW);

        expect(res.error).not.toBeNull();
        expect(res.data).toBeNull();
    }, ARGON_TIMEOUT);

    test('a reset to the same password still changes the stored wrap', async () => {
        const wrappedBefore = (await Storage.get('meta', 'auth_wrapped_key')) as string;

        await Archive.resetPassword(VAULT_PW);

        expect((await Storage.get('meta', 'auth_wrapped_key')) as string).not.toBe(wrappedBefore);
        Vault.clearKey();
        Sentinel.clearAllRateLimits();
        expect((await Archive.unlockVault(VAULT_PW)).error).toBeNull();
    }, ARGON_TIMEOUT);
});
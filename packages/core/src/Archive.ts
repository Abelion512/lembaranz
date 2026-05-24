import { Storage } from './Storage';
import { Vault, Result } from './Vault';
import { StoredNote, DecryptedNote, Note, EntityId } from './Formula';
import { v4 as uuidv4 } from 'uuid';
import { Integrity } from './Integrity';

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
 * Archive: Modul utama manajemen brankas dan catatan Lembaran.
 * Menangani siklus hidup data dari enkripsi, penyimpanan, hingga pemulihan.
 */
export const Archive = {
    async isVaultInitialized(): Promise<Result<boolean>> {
        try {
            const validator = await Storage.get('meta', 'auth_validator');
            return { data: !!validator, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Menyiapkan brankas baru dengan kata sandi dan kunci pemulihan (mnemonic).
     * @param password Kata sandi utama
     * @param mnemonic 12 kata kunci pemulihan (opsional)
     */
    async setupVault(password: string, mnemonic?: string): Promise<Result<void>> {
        if (process.env.DEBUG === 'true') console.log('[ARCHIVE] Memulai setupVault...');

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

        const validator = 'LEMBARAN_SECURED_V3';
        const valEncryptResult = await Vault.encryptPacked(validator, masterKey);
        if (valEncryptResult.error) return valEncryptResult;
        const encryptedValidator = valEncryptResult.data;

        await Storage.set('meta', 'auth_salt', saltHex);
        await Storage.set('meta', 'auth_wrapped_key', wrappedKey);
        await Storage.set('meta', 'auth_validator', encryptedValidator);

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

            await Storage.set('meta', 'recovery_salt', mSaltHex);
            await Storage.set('meta', 'recovery_wrapped_key', recoveryWrappedKey);
        }

        Vault.setActiveKey(masterKey);
        return { data: undefined, error: null };
    },

    /**
     * Membuka brankas menggunakan kata sandi.
     * Mendukung migrasi otomatis dari V2 ke V3.
     */
    async unlockVault(password: string): Promise<Result<boolean>> {
        try {
            // Panic Key Check
            const panicHash = await Storage.get('meta', 'panic_hash') as string;
            if (panicHash) {
                const currentHash = await Integrity.computeHash(password);
                if (currentHash === panicHash) {
                    await this.destroyAllData();
                    return { data: false, error: null };
                }
            }

            const saltHex = await Storage.get('meta', 'auth_salt') as string;
            const authValidator = await Storage.get('meta', 'auth_validator') as string;
            const wrappedKey = await Storage.get('meta', 'auth_wrapped_key') as string;

            if (!saltHex || !authValidator) return { data: null, error: new Error('Data otentikasi tidak lengkap') };

            const salt = Vault.hexToBytes(saltHex);

            const deriveResult = await Vault.deriveKey(password, salt);
            if (deriveResult.error) return deriveResult as Result<boolean>;
            const passwordKey = deriveResult.data;

            // Coba V3 (Decoupled Master Key)
            if (wrappedKey) {
                const decResult = await Vault.decryptPacked(wrappedKey, passwordKey);
                if (decResult.error) return decResult as Result<boolean>;

                const masterKeyBuffer = Vault.base64ToBytes(decResult.data).buffer;

                const importResult = await Vault.importRawKey(masterKeyBuffer);
                if (importResult.error) return importResult as Result<boolean>;
                const masterKey = importResult.data;

                const valResult = await Vault.decryptPacked(authValidator, masterKey);
                if (valResult.error) return valResult as Result<boolean>;

                if (valResult.data === 'LEMBARAN_SECURED_V3') {
                    Vault.setActiveKey(masterKey);
                    return { data: true, error: null };
                }
            } else {
                // Migrasi dari V2 (Master Key = Password Key)
                const [ivHex, base64Data] = authValidator.split('|');
                const iv = Vault.hexToBytes(ivHex);
                const bytes = Vault.base64ToBytes(base64Data);

                const decResult = await Vault.decrypt(bytes.buffer, iv, passwordKey);
                if (decResult.error) return decResult as Result<boolean>;

                if (decResult.data === 'LEMBARAN_SECURED_V2') {
                    Vault.setActiveKey(passwordKey);
                    // Lakukan migrasi ke V3 agar support reset password & recovery yang lebih baik
                    const resetRes = await this.resetPassword(password);
                    if (resetRes.error) console.warn('[ARCHIVE] Gagal migrasi otomatis ke V3:', resetRes.error.message);
                    return { data: true, error: null };
                }
            }

            return { data: false, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Memulihkan akses brankas menggunakan Kunci Kertas (mnemonic).
     */
    async recoverVault(mnemonic: string): Promise<Result<boolean>> {
        try {
            const mSaltHex = await Storage.get('meta', 'recovery_salt') as string;
            const wrappedKey = await Storage.get('meta', 'recovery_wrapped_key') as string;

            if (!mSaltHex || !wrappedKey) return { data: null, error: new Error('Data pemulihan tidak ditemukan') };

            const mSalt = Vault.hexToBytes(mSaltHex);

            const deriveResult = await Vault.deriveKey(mnemonic, mSalt);
            if (deriveResult.error) return deriveResult as Result<boolean>;
            const recoveryKey = deriveResult.data;

            const decResult = await Vault.decryptPacked(wrappedKey, recoveryKey);
            if (decResult.error) return decResult as Result<boolean>;

            const keyBuffer = Vault.base64ToBytes(decResult.data).buffer;

            const importResult = await Vault.importRawKey(keyBuffer);
            if (importResult.error) return importResult as Result<boolean>;

            Vault.setActiveKey(importResult.data);
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Menetapkan kata sandi baru untuk brankas yang sedang terbuka.
     */
    async resetPassword(newPassword: string): Promise<Result<void>> {
        const masterKey = Vault.getActiveKey();
        if (!masterKey) return { data: null, error: new Error('Vault Locked') };

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

        await Storage.set('meta', 'auth_salt', saltHex);
        await Storage.set('meta', 'auth_wrapped_key', wrappedKey);

        const validator = 'LEMBARAN_SECURED_V3';
        const valEncryptResult = await Vault.encryptPacked(validator, masterKey);
        if (valEncryptResult.error) return valEncryptResult;

        await Storage.set('meta', 'auth_validator', valEncryptResult.data);
        return { data: undefined, error: null };
    },

    /**
     * Menghapus seluruh data aplikasi secara permanen.
     */
    async destroyAllData(): Promise<void> {
        await Promise.all([
            Storage.clear('notes'),
            Storage.clear('folders'),
            Storage.clear('meta')
        ]);

        if (typeof window !== 'undefined') {
            const keys = Object.keys(window.localStorage);
            keys.forEach(key => {
                if (key.startsWith('lembaran:')) {
                    window.localStorage.removeItem(key);
                }
            });
            window.location.href = '/';
        }
    },

    /**
     * Saves a new note or updates an existing one.
     * Encrypts all sensitive fields before storage.
     */
    async saveNote(note: NoteInput): Promise<Result<StoredNote>> {
        if (Vault.isLocked()) {
            return { data: null, error: new Error('Vault locked. Cannot save data.') };
        }

        try {
            let title = note.title;
            if (!title || title === 'Untitled') {
                title = 'Note-' + new Date().toISOString().slice(0, 10);
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

            const existing = await Storage.get("notes", noteWithId.id) as StoredNote | undefined;
            if (existing && existing._hash === checkHash) {
                return { data: existing, error: null };
            }

            const preview = noteWithId.content.slice(0, 100) + (noteWithId.content.length > 100 ? '...' : '');

            const [resTitle, resContent, resPreview] = await Promise.all([
                Vault.encryptPacked(noteWithId.title),
                Vault.encryptPacked(noteWithId.content),
                Vault.encryptPacked(preview)
            ]);

            if (resTitle.error) return resTitle as Result<StoredNote>;
            if (resContent.error) return resContent as Result<StoredNote>;
            if (resPreview.error) return resPreview as Result<StoredNote>;

            let secureKredensial: string | undefined = undefined;
            if (note.credentials) {
                const credsStr = typeof note.credentials === 'string' ? note.credentials : JSON.stringify(note.credentials);
                const resCreds = await Vault.encryptPacked(credsStr);
                if (resCreds.error) return resCreds as Result<StoredNote>;
                secureKredensial = resCreds.data;
            }

            const finalNote: StoredNote = {
                ...noteWithId,
                title: resTitle.data,
                content: resContent.data,
                preview: resPreview.data,
                credentials: secureKredensial,
                isCredentials: note.isCredentials,
                updatedAt: new Date().toISOString(),
                _hash: checkHash,
            };

            await Storage.set('notes', finalNote.id, finalNote);
            return { data: finalNote, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Retrieves all notes with decrypted titles and previews.
     * Content remains encrypted for security.
     */
    async getAllNotes(): Promise<Result<DecryptedNote[]>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked') };

        try {
            const rawNotes = await Storage.getAll('notes') as StoredNote[];
            rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

            const decrypted = await Promise.all(rawNotes.map(async n => {
                const resTitle = await Vault.decryptPacked(n.title);
                const resPreview = await Vault.decryptPacked(n.preview || '');

                return {
                    ...n,
                    title: resTitle.error ? '⚠️ [CORRUPTED]' : resTitle.data,
                    preview: resPreview.error ? '⚠️ [CORRUPTED]' : resPreview.data,
                    content: '🔒 Locked',
                    credentials: undefined
                } as DecryptedNote;
            }));

            return { data: decrypted, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Fully decrypts a single note including content and credentials.
     */
    async decryptNote(note: StoredNote): Promise<Result<DecryptedNote>> {
        try {
            const resTitle = await Vault.decryptPacked(note.title);
            if (resTitle.error) return resTitle as Result<DecryptedNote>;

            const resContent = await Vault.decryptPacked(note.content);
            if (resContent.error) return resContent as Result<DecryptedNote>;

            let decodedCreds: DecryptedNote['credentials'] = undefined;
            if (typeof note.credentials === 'string') {
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
                credentials: decodedCreds
            };

            if (note._hash) {
                const actualHash = await Integrity.computeHash(decryptedNote);
                if (actualHash !== note._hash) {
                    decryptedNote.content = `⚠️ WARNING: Digital seal broken!\n\n` + decryptedNote.content;
                }
            }

            return { data: decryptedNote, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Menghapus catatan berdasarkan ID.
     */
    async deleteNote(id: EntityId) {
        await Storage.delete('notes', id);
    },

    /**
     * Mengambil catatan spesifik berdasarkan ID dan mendekripsinya.
     */
    async getNoteById(id: EntityId): Promise<Result<Note | undefined>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked') };
        try {
            const note = await Storage.get('notes', id) as StoredNote | undefined;
            if (!note) return { data: undefined, error: null };
            return this.decryptNote(note);
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Mengambil statistik jumlah catatan dan folder.
     */
    async getStats() {
        try {
            const notesCount = await Storage.count('notes');
            const foldersCount = await Storage.count('folders');
            return { notes: notesCount, folders: foldersCount };
        } catch {
            return { notes: 0, folders: 0 };
        }
    },

    /**
     * Menetapkan Panic Key: kata sandi yang jika dimasukkan saat login
     * akan menghapus semua data brankas secara permanen.
     * @param panicPassword Kata sandi yang akan bertindak sebagai tombol panik
     */
    async setPanicKey(panicPassword: string): Promise<void> {
        const hash = await Integrity.computeHash(panicPassword);
        await Storage.set('meta', 'panic_hash', hash);
    },

    /**
     * Membuat cadangan (backup) portabel.
     * Mendekripsi semua data di memori, membungkusnya dalam JSON plaintext,
     * lalu mengenkripsinya dengan struktur portabel dan password backup.
     * Ini memungkinkan file dibuka di mesin lain.
     */
    async createBackup(passwordBackup: string): Promise<Result<Uint8Array>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked') };

        try {
            const rawNotes = await Storage.getAll('notes') as StoredNote[];

            const plainNotes: Note[] = [];
            for (const n of rawNotes) {
                const res = await this.decryptNote(n);
                if (res.error) {
                    console.error(`[ARCHIVE] Failed to decrypt note ${n.id} for backup.`);
                    continue;
                }
                plainNotes.push(res.data);
            }

            const payload = JSON.stringify({
                version: '3.5.0',
                exportedAt: new Date().toISOString(),
                notes: plainNotes,
            });

            return await Vault.encryptPortable(payload, passwordBackup);
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Restores the vault from a portable backup file.
     * @param buffer Binary data from .lembaran backup file
     * @param passwordBackup Password used to encrypt the backup
     */
    async restoreBackup(buffer: Uint8Array, passwordBackup: string): Promise<Result<{ restored: number, skipped: number }>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked: Unlock vault before restoring data.') };

        try {
            const resDec = await Vault.decryptPortable(buffer, passwordBackup);
            if (resDec.error) return { data: null, error: new Error('Failed to open backup file. Wrong password or corrupted file.', { cause: resDec.error }) };

            let backup: { version?: string; notes?: StoredNote[] };
            try {
                backup = JSON.parse(resDec.data, (_key, value) => {
                    // Prevent prototype pollution
                    if (_key === '__proto__' || _key === 'constructor' || _key === 'prototype') return undefined;
                    return value;
                });
            } catch {
                return { data: null, error: new Error('Invalid backup format: Failed to parse backup data.') };
            }

            if (!backup.notes || !Array.isArray(backup.notes)) {
                return { data: null, error: new Error('Invalid backup format: No notes data found.') };
            }

            const notes = backup.notes as StoredNote[];
            let restored = 0;
            let skipped = 0;

            // Fetch all existing notes for fast lookup
            const existingNotes = await Storage.getAll('notes') as StoredNote[];
            const existingNotesMap = new Map<string, StoredNote>(existingNotes.map(n => [n.id, n]));

            const restorePromises = notes.map(async (note) => {
                const existing = existingNotesMap.get(note.id);
                if (existing) {
                    const existingDate = new Date(existing.updatedAt).getTime();
                    const newDate = new Date(note.updatedAt).getTime();
                    if (existingDate >= newDate) {
                        return { status: 'skipped' as const, id: note.id };
                    }
                }

                // Convert StoredNote to NoteInput for saveNote
                const noteInput: NoteInput = {
                    id: note.id,
                    title: note.title,
                    content: note.content,
                    folderId: note.folderId,
                    isPinned: note.isPinned,
                    isFavorite: note.isFavorite,
                    tags: note.tags,
                    createdAt: note.createdAt,
                    credentials: note.credentials ? JSON.parse(note.credentials, (_k, v) => {
                        if (_k === '__proto__' || _k === 'constructor' || _k === 'prototype') return undefined;
                        return v;
                    }) : undefined,
                };

                const resSave = await this.saveNote(noteInput);
                if (resSave.error) {
                    console.error(`[ARCHIVE] Failed to restore note ${note.id}:`, resSave.error.message);
                    return { status: 'error' as const, id: note.id };
                } else {
                    return { status: 'restored' as const, id: note.id };
                }
            });

            const results = await Promise.all(restorePromises);

            for (const res of results) {
                if (res.status === 'skipped' || res.status === 'error') {
                    skipped++;
                } else if (res.status === 'restored') {
                    restored++;
                }
            }

            return { data: { restored, skipped }, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }
};

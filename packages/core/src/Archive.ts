import { Storage } from './Storage';
import { Vault, Result } from './Vault';
import { Note, EntityId } from './Formula';
import { v4 as uuidv4 } from 'uuid';
import { Integrity } from './Integrity';
import { Poet } from './Poet';

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
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        const deriveResult = await Vault.deriveKey(password, salt);
        if (deriveResult.error) return deriveResult;
        const passwordKey = deriveResult.data;

        const wrapResult = await Vault.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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
            const mSaltHex = Array.from(mnemonicSalt).map(b => b.toString(16).padStart(2, '0')).join('');

            const mDeriveResult = await Vault.deriveKey(mnemonic, mnemonicSalt);
            if (mDeriveResult.error) return mDeriveResult;
            const recoveryKey = mDeriveResult.data;

            const mWrapResult = await Vault.encryptPacked(
                btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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

            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

            const deriveResult = await Vault.deriveKey(password, salt);
            if (deriveResult.error) return deriveResult as Result<boolean>;
            const passwordKey = deriveResult.data;

            // Coba V3 (Decoupled Master Key)
            if (wrappedKey) {
                const decResult = await Vault.decryptPacked(wrappedKey, passwordKey);
                if (decResult.error) return decResult as Result<boolean>;

                const masterKeyBuffer = Uint8Array.from(atob(decResult.data), c => c.charCodeAt(0)).buffer;

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
                const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

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

            const mSalt = new Uint8Array(mSaltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

            const deriveResult = await Vault.deriveKey(mnemonic, mSalt);
            if (deriveResult.error) return deriveResult as Result<boolean>;
            const recoveryKey = deriveResult.data;

            const decResult = await Vault.decryptPacked(wrappedKey, recoveryKey);
            if (decResult.error) return decResult as Result<boolean>;

            const keyBuffer = Uint8Array.from(atob(decResult.data), c => c.charCodeAt(0)).buffer;

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
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        const deriveResult = await Vault.deriveKey(newPassword, salt);
        if (deriveResult.error) return deriveResult;
        const passwordKey = deriveResult.data;

        const wrapResult = await Vault.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
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
     * Menyimpan catatan baru atau memperbarui catatan lama.
     */
    async saveNote(note: Omit<Note, 'updatedAt'>): Promise<Result<Note>> {
        if (Vault.isLocked()) {
            return { data: null, error: new Error('Vault locked. Cannot save data.') };
        }

        try {
            let title = note.title;
            if (!title || title === 'Tanpa Judul') {
                title = await Poet.suggestTitle(note.content);
            }

            const suggestedTags = await Poet.suggestTags(note.content);
            const tags = Array.from(new Set([...(note.tags || []), ...suggestedTags]));

            const noteWithId = {
                ...note,
                title,
                tags,
                id: note.id || uuidv4(),
                createdAt: note.createdAt || new Date().toISOString(),
            } as Note;

            const checkHash = await Integrity.computeHash(noteWithId);

            const existing = await Storage.get("notes", noteWithId.id);
            if (existing && existing._hash === checkHash) {
                return { data: existing, error: null };
            }

            const preview = await Poet.smartSummary(noteWithId.content);

            const [resTitle, resContent, resPreview] = await Promise.all([
                Vault.encryptPacked(noteWithId.title),
                Vault.encryptPacked(noteWithId.content),
                Vault.encryptPacked(preview)
            ]);

            if (resTitle.error) return resTitle as Result<Note>;
            if (resContent.error) return resContent as Result<Note>;
            if (resPreview.error) return resPreview as Result<Note>;

            let secureKredensial: string | undefined = undefined;
            if (note.kredensial) {
                const credsStr = typeof note.kredensial === 'string' ? note.kredensial : JSON.stringify(note.kredensial);
                const resCreds = await Vault.encryptPacked(credsStr);
                if (resCreds.error) return resCreds as Result<Note>;
                secureKredensial = resCreds.data;
            }

            const finalNote: Note = {
                ...noteWithId,
                title: resTitle.data,
                content: resContent.data,
                preview: resPreview.data,
                kredensial: secureKredensial as any,
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
     * Mengambil seluruh catatan yang sudah didekripsi minimal.
     */
    async getAllNotes(): Promise<Result<Note[]>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked') };

        try {
            const rawNotes = await Storage.getAll('notes') as Note[];
            rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

            const decrypted = await Promise.all(rawNotes.map(async n => {
                const resTitle = await Vault.decryptPacked(n.title);
                const resPreview = await Vault.decryptPacked(n.preview || '');

                return {
                    ...n,
                    title: resTitle.error ? '⚠️ [DATA RUSAK]' : resTitle.data,
                    preview: resPreview.error ? '⚠️ [DATA RUSAK]' : resPreview.data,
                    content: '🔒 Terkunci',
                    kredensial: undefined
                };
            }));

            return { data: decrypted, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Mendekripsi catatan secara penuh.
     */
    async decryptNote(note: Note): Promise<Result<Note>> {
        try {
            const resTitle = await Vault.decryptPacked(note.title);
            if (resTitle.error) return resTitle as Result<Note>;

            const resContent = await Vault.decryptPacked(note.content);
            if (resContent.error) return resContent as Result<Note>;

            let decodedCreds = note.kredensial;
            if (typeof note.kredensial === 'string') {
                const resCreds = await Vault.decryptPacked(note.kredensial);
                if (!resCreds.error) {
                    try {
                        decodedCreds = JSON.parse(resCreds.data);
                    } catch {
                        decodedCreds = resCreds.data;
                    }
                }
            }

            const decryptedNote = {
                ...note,
                title: resTitle.data,
                content: resContent.data,
                kredensial: decodedCreds
            };

            if (note._hash) {
                const actualHash = await Integrity.computeHash(decryptedNote);
                if (actualHash !== note._hash) {
                    decryptedNote.content = `⚠️ PERINGATAN: Segel digital rusak!\n\n` + decryptedNote.content;
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
            const note = await Storage.get('notes', id) as Note;
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
    async cadangkan(passwordBackup: string): Promise<Result<Uint8Array>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked') };

        try {
            const rawNotes = await Storage.getAll('notes') as Note[];

            const plainNotes: Note[] = [];
            for (const n of rawNotes) {
                const res = await this.decryptNote(n);
                if (res.error) {
                    console.error(`[ARCHIVE] Gagal dekripsi catatan ${n.id} untuk cadangan.`);
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
     * Memulihkan brankas dari file cadangan portabel.
     * @param buffer Data biner dari file .lembaran
     * @param passwordBackup Password yang digunakan untuk mengenkripsi cadangan
     */
    async pulihkan(buffer: Uint8Array, passwordBackup: string): Promise<Result<{ restored: number, skipped: number }>> {
        if (Vault.isLocked()) return { data: null, error: new Error('Vault locked: Unlock vault before restoring data.') };

        try {
            const resDec = await Vault.decryptPortable(buffer, passwordBackup);
            if (resDec.error) return { data: null, error: new Error('Gagal membuka file cadangan. Password salah atau file rusak.', { cause: resDec.error }) };

            const backup = JSON.parse(resDec.data);
            if (!backup.notes || !Array.isArray(backup.notes)) {
                return { data: null, error: new Error('Format cadangan tidak valid: Data notes tidak ditemukan.') };
            }

            const notes = backup.notes as Note[];
            let restored = 0;
            let skipped = 0;

            // Fetch all existing notes for fast lookup
            const existingNotes = await Storage.getAll('notes') as Note[];
            const existingNotesMap = new Map(existingNotes.map(n => [n.id, n]));

            const restorePromises = notes.map(async (note) => {
                // Cek apakah note sudah ada dan lebih baru? (Simple collision detection)
                const existing = existingNotesMap.get(note.id);
                if (existing) {
                    const existingDate = new Date(existing.updatedAt).getTime();
                    const newDate = new Date(note.updatedAt).getTime();
                    if (existingDate >= newDate) {
                        return { status: 'skipped', id: note.id };
                    }
                }

                // Enkripsi ulang menggunakan saveNote (otomatis pakai Master Key aktif)
                const resSave = await this.saveNote(note);
                if (resSave.error) {
                    console.error(`[ARCHIVE] Gagal memulihkan note ${note.id}:`, resSave.error.message);
                    return { status: 'error', id: note.id };
                } else {
                    return { status: 'restored', id: note.id };
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

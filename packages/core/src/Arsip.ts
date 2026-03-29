import { Gudang } from './Gudang';
import { Brankas, Hasil } from './Brankas';
import { Note, EntityId } from './Rumus';
import { v4 as uuidv4 } from 'uuid';
import { Integritas } from './Integritas';
import { Pujangga } from './Pujangga';

/**
 * Arsip: Modul utama manajemen brankas dan catatan Lembaran.
 * Menangani siklus hidup data dari enkripsi, penyimpanan, hingga pemulihan.
 */
export const Arsip = {
    async isVaultInitialized(): Promise<Hasil<boolean>> {
        try {
            const validator = await Gudang.get('meta', 'auth_validator');
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
    async setupVault(password: string, mnemonic?: string): Promise<Hasil<void>> {
        if (process.env.DEBUG === 'true') console.log('[ARSIP] Memulai setupVault...');

        const genResult = await Brankas.generateMasterKey();
        if (genResult.error) return genResult;
        const masterKey = genResult.data;

        const exportResult = await Brankas.exportRawKey(masterKey);
        if (exportResult.error) return exportResult;
        const masterKeyBuffer = exportResult.data;

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        
        const deriveResult = await Brankas.deriveKey(password, salt);
        if (deriveResult.error) return deriveResult;
        const passwordKey = deriveResult.data;

        const wrapResult = await Brankas.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
            passwordKey
        );
        if (wrapResult.error) return wrapResult;
        const wrappedKey = wrapResult.data;

        const validator = 'LEMBARAN_SECURED_V3';
        const valEncryptResult = await Brankas.encryptPacked(validator, masterKey);
        if (valEncryptResult.error) return valEncryptResult;
        const encryptedValidator = valEncryptResult.data;

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_wrapped_key', wrappedKey);
        await Gudang.set('meta', 'auth_validator', encryptedValidator);

        if (mnemonic) {
            const mnemonicSalt = crypto.getRandomValues(new Uint8Array(16));
            const mSaltHex = Array.from(mnemonicSalt).map(b => b.toString(16).padStart(2, '0')).join('');
            
            const mDeriveResult = await Brankas.deriveKey(mnemonic, mnemonicSalt);
            if (mDeriveResult.error) return mDeriveResult;
            const recoveryKey = mDeriveResult.data;

            const mWrapResult = await Brankas.encryptPacked(
                btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
                recoveryKey
            );
            if (mWrapResult.error) return mWrapResult;
            const recoveryWrappedKey = mWrapResult.data;

            await Gudang.set('meta', 'recovery_salt', mSaltHex);
            await Gudang.set('meta', 'recovery_wrapped_key', recoveryWrappedKey);
        }

        Brankas.setActiveKey(masterKey);
        return { data: undefined, error: null };
    },

    /**
     * Membuka brankas menggunakan kata sandi.
     * Mendukung migrasi otomatis dari V2 ke V3.
     */
    async unlockVault(password: string): Promise<Hasil<boolean>> {
        try {
            // Panic Key Check
            const panicHash = await Gudang.get('meta', 'panic_hash') as string;
            if (panicHash) {
                const currentHash = await Integritas.hitungHash(password);
                if (currentHash === panicHash) {
                    await this.destroyAllData();
                    return { data: false, error: null };
                }
            }

            const saltHex = await Gudang.get('meta', 'auth_salt') as string;
            const authValidator = await Gudang.get('meta', 'auth_validator') as string;
            const wrappedKey = await Gudang.get('meta', 'auth_wrapped_key') as string;

            if (!saltHex || !authValidator) return { data: null, error: new Error('Data otentikasi tidak lengkap') };

            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            
            const deriveResult = await Brankas.deriveKey(password, salt);
            if (deriveResult.error) return deriveResult as Hasil<boolean>;
            const passwordKey = deriveResult.data;

            // Coba V3 (Decoupled Master Key)
            if (wrappedKey) {
                const decResult = await Brankas.decryptPacked(wrappedKey, passwordKey);
                if (decResult.error) return decResult as Hasil<boolean>;
                
                const masterKeyBuffer = Uint8Array.from(atob(decResult.data), c => c.charCodeAt(0)).buffer;
                
                const importResult = await Brankas.importRawKey(masterKeyBuffer);
                if (importResult.error) return importResult as Hasil<boolean>;
                const masterKey = importResult.data;

                const valResult = await Brankas.decryptPacked(authValidator, masterKey);
                if (valResult.error) return valResult as Hasil<boolean>;

                if (valResult.data === 'LEMBARAN_SECURED_V3') {
                    Brankas.setActiveKey(masterKey);
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

                const decResult = await Brankas.decrypt(bytes.buffer, iv, passwordKey);
                if (decResult.error) return decResult as Hasil<boolean>;

                if (decResult.data === 'LEMBARAN_SECURED_V2') {
                    Brankas.setActiveKey(passwordKey);
                    // Lakukan migrasi ke V3 agar support reset password & recovery yang lebih baik
                    const resetRes = await this.resetPassword(password);
                    if (resetRes.error) console.warn('[ARSIP] Gagal migrasi otomatis ke V3:', resetRes.error.message);
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
    async recoverVault(mnemonic: string): Promise<Hasil<boolean>> {
        try {
            const mSaltHex = await Gudang.get('meta', 'recovery_salt') as string;
            const wrappedKey = await Gudang.get('meta', 'recovery_wrapped_key') as string;

            if (!mSaltHex || !wrappedKey) return { data: null, error: new Error('Data pemulihan tidak ditemukan') };

            const mSalt = new Uint8Array(mSaltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            
            const deriveResult = await Brankas.deriveKey(mnemonic, mSalt);
            if (deriveResult.error) return deriveResult as Hasil<boolean>;
            const recoveryKey = deriveResult.data;

            const decResult = await Brankas.decryptPacked(wrappedKey, recoveryKey);
            if (decResult.error) return decResult as Hasil<boolean>;
            
            const keyBuffer = Uint8Array.from(atob(decResult.data), c => c.charCodeAt(0)).buffer;
            
            const importResult = await Brankas.importRawKey(keyBuffer);
            if (importResult.error) return importResult as Hasil<boolean>;
            
            Brankas.setActiveKey(importResult.data);
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Menetapkan kata sandi baru untuk brankas yang sedang terbuka.
     */
    async resetPassword(newPassword: string): Promise<Hasil<void>> {
        const masterKey = Brankas.getActiveKey();
        if (!masterKey) return { data: null, error: new Error('Brankas Terkunci') };

        const exportResult = await Brankas.exportRawKey(masterKey);
        if (exportResult.error) return exportResult;
        const masterKeyBuffer = exportResult.data;

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        
        const deriveResult = await Brankas.deriveKey(newPassword, salt);
        if (deriveResult.error) return deriveResult;
        const passwordKey = deriveResult.data;

        const wrapResult = await Brankas.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
            passwordKey
        );
        if (wrapResult.error) return wrapResult;
        const wrappedKey = wrapResult.data;

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_wrapped_key', wrappedKey);

        const validator = 'LEMBARAN_SECURED_V3';
        const valEncryptResult = await Brankas.encryptPacked(validator, masterKey);
        if (valEncryptResult.error) return valEncryptResult;
        
        await Gudang.set('meta', 'auth_validator', valEncryptResult.data);
        return { data: undefined, error: null };
    },

    /**
     * Menghapus seluruh data aplikasi secara permanen.
     */
    async destroyAllData(): Promise<void> {
        await Promise.all([
            Gudang.clear('notes'),
            Gudang.clear('folders'),
            Gudang.clear('meta')
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
    async saveNote(note: Omit<Note, 'updatedAt'>): Promise<Hasil<Note>> {
        if (Brankas.isLocked()) {
            return { data: null, error: new Error('Brankas terkunci. Tidak dapat menyimpan data.') };
        }

        try {
            let title = note.title;
            if (!title || title === 'Tanpa Judul') {
                title = await Pujangga.sarankanJudul(note.content);
            }

            const suggestedTags = await Pujangga.sarankanTag(note.content);
            const tags = Array.from(new Set([...(note.tags || []), ...suggestedTags]));

            const noteWithId = {
                ...note,
                title,
                tags,
                id: note.id || uuidv4(),
                createdAt: note.createdAt || new Date().toISOString(),
            } as Note;

            const checkHash = await Integritas.hitungHash(noteWithId);

            const existing = await Gudang.get("notes", noteWithId.id);
            if (existing && existing._hash === checkHash) {
                return { data: existing, error: null };
            }

            const preview = await Pujangga.ringkasCerdas(noteWithId.content);

            const [resTitle, resContent, resPreview] = await Promise.all([
                Brankas.encryptPacked(noteWithId.title),
                Brankas.encryptPacked(noteWithId.content),
                Brankas.encryptPacked(preview)
            ]);

            if (resTitle.error) return resTitle as Hasil<Note>;
            if (resContent.error) return resContent as Hasil<Note>;
            if (resPreview.error) return resPreview as Hasil<Note>;

            let secureKredensial: string | undefined = undefined;
            if (note.kredensial) {
                const credsStr = typeof note.kredensial === 'string' ? note.kredensial : JSON.stringify(note.kredensial);
                const resCreds = await Brankas.encryptPacked(credsStr);
                if (resCreds.error) return resCreds as Hasil<Note>;
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

            await Gudang.set('notes', finalNote.id, finalNote);
            return { data: finalNote, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Mengambil seluruh catatan yang sudah didekripsi minimal.
     */
    async getAllNotes(): Promise<Hasil<Note[]>> {
        if (Brankas.isLocked()) return { data: null, error: new Error('Brankas terkunci') };
        
        try {
            const rawNotes = await Gudang.getAll('notes') as Note[];
            rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

            const decrypted = await Promise.all(rawNotes.map(async n => {
                const resTitle = await Brankas.decryptPacked(n.title);
                const resPreview = await Brankas.decryptPacked(n.preview || '');

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
    async decryptNote(note: Note): Promise<Hasil<Note>> {
        try {
            const resTitle = await Brankas.decryptPacked(note.title);
            if (resTitle.error) return resTitle as Hasil<Note>;

            const resContent = await Brankas.decryptPacked(note.content);
            if (resContent.error) return resContent as Hasil<Note>;

            let decodedCreds = note.kredensial;
            if (typeof note.kredensial === 'string') {
                const resCreds = await Brankas.decryptPacked(note.kredensial);
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
                const actualHash = await Integritas.hitungHash(decryptedNote);
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
        await Gudang.delete('notes', id);
    },

    /**
     * Mengambil catatan spesifik berdasarkan ID dan mendekripsinya.
     */
    async getNoteById(id: EntityId): Promise<Hasil<Note | undefined>> {
        if (Brankas.isLocked()) return { data: null, error: new Error('Brankas terkunci') };
        try {
            const note = await Gudang.get('notes', id) as Note;
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
            const notesCount = await Gudang.count('notes');
            const foldersCount = await Gudang.count('folders');
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
        const hash = await Integritas.hitungHash(panicPassword);
        await Gudang.set('meta', 'panic_hash', hash);
    },

    /**
     * Membuat cadangan (backup) portabel.
     * Mendekripsi semua data di memori, membungkusnya dalam JSON plaintext,
     * lalu mengenkripsinya dengan struktur portabel dan password backup.
     * Ini memungkinkan file dibuka di mesin lain.
     */
    async cadangkan(passwordBackup: string): Promise<Hasil<Uint8Array>> {
        if (Brankas.isLocked()) return { data: null, error: new Error('Brankas terkunci') };

        try {
            const rawNotes = await Gudang.getAll('notes') as Note[];
            
            const plainNotes: Note[] = [];
            for (const n of rawNotes) {
                const res = await this.decryptNote(n);
                if (res.error) {
                    console.error(`[ARSIP] Gagal dekripsi catatan ${n.id} untuk cadangan.`);
                    continue; 
                }
                plainNotes.push(res.data);
            }

            const payload = JSON.stringify({
                version: '3.5.0',
                exportedAt: new Date().toISOString(),
                notes: plainNotes,
            });

            return await Brankas.encryptPortable(payload, passwordBackup);
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    },

    /**
     * Memulihkan brankas dari file cadangan portabel.
     * @param buffer Data biner dari file .lembaran
     * @param passwordBackup Password yang digunakan untuk mengenkripsi cadangan
     */
    async pulihkan(buffer: Uint8Array, passwordBackup: string): Promise<Hasil<{ restored: number, skipped: number }>> {
        if (Brankas.isLocked()) return { data: null, error: new Error('Brankas terkunci: Buka brankas sebelum memulihkan data.') };

        try {
            const resDec = await Brankas.decryptPortable(buffer, passwordBackup);
            if (resDec.error) return { data: null, error: new Error('Gagal membuka file cadangan. Password salah atau file rusak.', { cause: resDec.error }) };

            const backup = JSON.parse(resDec.data);
            if (!backup.notes || !Array.isArray(backup.notes)) {
                return { data: null, error: new Error('Format cadangan tidak valid: Data notes tidak ditemukan.') };
            }

            const notes = backup.notes as Note[];
            let restored = 0;
            let skipped = 0;

            for (const note of notes) {
                // Cek apakah note sudah ada dan lebih baru? (Simple collision detection)
                const existing = await Gudang.get('notes', note.id);
                if (existing) {
                    const existingDate = new Date(existing.updatedAt).getTime();
                    const newDate = new Date(note.updatedAt).getTime();
                    if (existingDate >= newDate) {
                        skipped++;
                        continue;
                    }
                }

                // Enkripsi ulang menggunakan saveNote (otomatis pakai Master Key aktif)
                const resSave = await this.saveNote(note);
                if (resSave.error) {
                    console.error(`[ARSIP] Gagal memulihkan note ${note.id}:`, resSave.error.message);
                    skipped++;
                } else {
                    restored++;
                }
            }

            return { data: { restored, skipped }, error: null };
        } catch (e) {
            return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }
};

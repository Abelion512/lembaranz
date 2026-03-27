import { Gudang } from './Gudang';
import { Brankas } from './Brankas';
import { Note, EntityId, NoteInput } from './Rumus';
import { v4 as uuidv4 } from 'uuid';
import { Integritas } from './Integritas';
import { Pujangga } from './Pujangga';

/**
 * Arsip: Modul utama manajemen brankas dan catatan Lembaran.
 * Menangani siklus hidup data dari enkripsi, penyimpanan, hingga pemulihan.
 */
export const Arsip = {
    /**
     * Memeriksa apakah brankas sudah pernah diinisialisasi.
     */
    async isVaultInitialized(): Promise<boolean> {
        const validator = await Gudang.get('meta', 'auth_validator');
        return !!validator;
    },

    /**
     * Menyiapkan brankas baru dengan kata sandi dan kunci pemulihan (mnemonic).
     * @param password Kata sandi utama
     * @param mnemonic 12 kata kunci pemulihan (opsional)
     */
    async setupVault(password: string, mnemonic?: string): Promise<void> {
        if (process.env.DEBUG === 'true') console.log('[ARSIP] Memulai setupVault...');

        const masterKey = await Brankas.generateMasterKey();
        const masterKeyBuffer = await Brankas.exportRawKey(masterKey);

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        const passwordKey = await Brankas.deriveKey(password, salt);

        const wrappedKey = await Brankas.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
            passwordKey
        );

        const validator = 'LEMBARAN_SECURED_V3';
        const encryptedValidator = await Brankas.encryptPacked(validator, masterKey);

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_wrapped_key', wrappedKey);
        await Gudang.set('meta', 'auth_validator', encryptedValidator);

        if (mnemonic) {
            const mnemonicSalt = crypto.getRandomValues(new Uint8Array(16));
            const mSaltHex = Array.from(mnemonicSalt).map(b => b.toString(16).padStart(2, '0')).join('');
            const recoveryKey = await Brankas.deriveKey(mnemonic, mnemonicSalt);

            const recoveryWrappedKey = await Brankas.encryptPacked(
                btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
                recoveryKey
            );

            await Gudang.set('meta', 'recovery_salt', mSaltHex);
            await Gudang.set('meta', 'recovery_wrapped_key', recoveryWrappedKey);
        }

        Brankas.setActiveKey(masterKey);
    },

    /**
     * Membuka brankas menggunakan kata sandi.
     * Mendukung migrasi otomatis dari V2 ke V3.
     */
    async unlockVault(password: string): Promise<boolean> {
        try {
            // Panic Key Check
            const panicHash = await Gudang.get('meta', 'panic_hash') as string;
            if (panicHash) {
                const currentHash = await Integritas.hitungHash(password);
                if (currentHash === panicHash) {
                    await this.destroyAllData();
                    return false;
                }
            }

            const saltHex = await Gudang.get('meta', 'auth_salt') as string;
            const authValidator = await Gudang.get('meta', 'auth_validator') as string;
            const wrappedKey = await Gudang.get('meta', 'auth_wrapped_key') as string;

            if (!saltHex || !authValidator) return false;

            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const passwordKey = await Brankas.deriveKey(password, salt);

            // Coba V3 (Decoupled Master Key)
            if (wrappedKey) {
                const masterKeyBase64 = await Brankas.decryptPacked(wrappedKey, passwordKey);
                const masterKeyBuffer = Uint8Array.from(atob(masterKeyBase64), c => c.charCodeAt(0)).buffer;
                const masterKey = await Brankas.importRawKey(masterKeyBuffer);

                const decryptedValidator = await Brankas.decryptPacked(authValidator, masterKey);
                if (decryptedValidator === 'LEMBARAN_SECURED_V3') {
                    Brankas.setActiveKey(masterKey);
                    return true;
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

                const decrypted = await Brankas.decrypt(bytes.buffer, iv, passwordKey);
                if (decrypted === 'LEMBARAN_SECURED_V2') {
                    Brankas.setActiveKey(passwordKey);
                    // Lakukan migrasi ke V3 agar support reset password & recovery yang lebih baik
                    await this.resetPassword(password);
                    return true;
                }
            }

            return false;
        } catch (_e) {
            console.error('[ARSIP] Gagal membuka brankas (ERR_AUTH_001)');
            return false;
        }
    },

    /**
     * Memulihkan akses brankas menggunakan Kunci Kertas (mnemonic).
     */
    async recoverVault(mnemonic: string): Promise<boolean> {
        try {
            const mSaltHex = await Gudang.get('meta', 'recovery_salt') as string;
            const wrappedKey = await Gudang.get('meta', 'recovery_wrapped_key') as string;

            if (!mSaltHex || !wrappedKey) return false;

            const mSalt = new Uint8Array(mSaltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const recoveryKey = await Brankas.deriveKey(mnemonic, mSalt);

            const decryptedKeyBase64 = await Brankas.decryptPacked(wrappedKey, recoveryKey);
            const keyBuffer = Uint8Array.from(atob(decryptedKeyBase64), c => c.charCodeAt(0)).buffer;
            const masterKey = await Brankas.importRawKey(keyBuffer);

            Brankas.setActiveKey(masterKey);
            return true;
        } catch (_e) {
            console.error('[ARSIP] Pemulihan gagal (ERR_REC_001)');
            return false;
        }
    },

    /**
     * Menetapkan kata sandi baru untuk brankas yang sedang terbuka.
     */
    async resetPassword(newPassword: string): Promise<void> {
        const masterKey = Brankas.getActiveKey();
        if (!masterKey) throw new Error('Vault Locked');

        const masterKeyBuffer = await Brankas.exportRawKey(masterKey);

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        const passwordKey = await Brankas.deriveKey(newPassword, salt);

        const wrappedKey = await Brankas.encryptPacked(
            btoa(String.fromCharCode(...new Uint8Array(masterKeyBuffer))),
            passwordKey
        );

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_wrapped_key', wrappedKey);

        const validator = 'LEMBARAN_SECURED_V3';
        const encryptedValidator = await Brankas.encryptPacked(validator, masterKey);
        await Gudang.set('meta', 'auth_validator', encryptedValidator);
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
    async saveNote(note: NoteInput): Promise<Note> {
        if (Brankas.isLocked()) {
            throw new Error('Vault is locked. Cannot save data.');
        }

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
            return existing;
        }

        const preview = await Pujangga.ringkasCerdas(noteWithId.content);

        const [secureTitle, secureContent, securePreview] = await Promise.all([
            Brankas.encryptPacked(noteWithId.title),
            Brankas.encryptPacked(noteWithId.content),
            Brankas.encryptPacked(preview)
        ]);

        let secureKredensial: typeof note.kredensial | string = note.kredensial;
        if (note.kredensial && typeof note.kredensial !== 'string') {
            secureKredensial = await Brankas.encryptPacked(JSON.stringify(note.kredensial));
        }

        const finalNote: Note = {
            ...noteWithId,
            title: secureTitle,
            content: secureContent,
            preview: securePreview,
            kredensial: secureKredensial as Note['kredensial'],
            updatedAt: new Date().toISOString(),
            _hash: checkHash,
        };

        await Gudang.set('notes', finalNote.id, finalNote);
        return finalNote;
    },

    /**
     * Mengambil seluruh catatan yang sudah didekripsi minimal.
     */
    async getAllNotes(): Promise<Note[]> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const rawNotes = await Gudang.getAll('notes') as Note[];

        rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

        const decrypted = await Promise.all(rawNotes.map(async n => {
            let safeTitle: string;
            let safePreview: string;

            try {
                safeTitle = await Brankas.decryptPacked(n.title);
            } catch (_e) {
                safeTitle = '⚠️ [DATA RUSAK/TAMPERED]';
            }

            try {
                safePreview = await Brankas.decryptPacked(n.preview || '');
            } catch (_e) {
                safePreview = '⚠️ [DATA RUSAK/TAMPERED]';
            }

            return {
                ...n,
                title: safeTitle,
                preview: safePreview,
                content: '🔒 Terkunci', // Jauhkan konten dari RAM di list all notes
                kredensial: undefined
            };
        }));

        return decrypted;
    },

    /**
     * Mendekripsi catatan secara penuh.
     */
    async decryptNote(note: Note): Promise<Note> {
        try {
            const [title, content, credsRaw] = await Promise.all([
                Brankas.decryptPacked(note.title),
                Brankas.decryptPacked(note.content),
                typeof note.kredensial === 'string' ? Brankas.decryptPacked(note.kredensial) : null
            ]);

            const decryptedNote = {
                ...note,
                title,
                content,
                kredensial: credsRaw ? JSON.parse(credsRaw) : note.kredensial
            };

            if (note._hash) {
                const actualHash = await Integritas.hitungHash(decryptedNote);
                if (actualHash !== note._hash) {
                    decryptedNote.content = `⚠️ PERINGATAN: Segel digital rusak!\n\n` + decryptedNote.content;
                }
            }

            return decryptedNote;
        } catch (_err) {
            console.error('[ARSIP] Gagal mendekripsi catatan. Kemungkinan tampering / korupsi data (ERR_DEC_001)');
            return { 
                ...note, 
                title: '⚠️ [DATA RUSAK/TAMPERED]',
                content: '⚠️ Gagal Dekripsi Data. Integritas kriptografi tertolak.',
                preview: '⚠️ [DATA RUSAK/TAMPERED]',
                kredensial: undefined
            };
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
    async getNoteById(id: EntityId): Promise<Note | undefined> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const note = await Gudang.get('notes', id) as Note;
        if (!note) return undefined;
        return this.decryptNote(note);
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
    }
};


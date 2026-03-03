import { Gudang } from './Gudang';
import { Brankas } from './Brankas';
import { Note, EntityId } from './Rumus';
import { v4 as uuidv4 } from 'uuid';
import { Integritas } from './Integritas';
import { Pujangga } from './Pujangga';

export const Arsip = {
    async isVaultInitialized(): Promise<boolean> {
        const validator = await Gudang.get('meta', 'auth_validator');
        return !!validator;
    },

    async setupVault(password: string): Promise<void> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        const key = await Brankas.deriveKey(password, salt);
        const validator = 'LEMBARAN_SECURED_V2';
        const encryptedValidator = await Brankas.encrypt(validator, key);

        const ivHex = Array.from(encryptedValidator.iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(encryptedValidator.data)));

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_validator', `${ivHex}|${base64Data}`);

        Brankas.setActiveKey(key);
    },

    async unlockVault(password: string): Promise<boolean> {
        try {
            // Panic Key Check
            const panicHash = await Gudang.get('meta', 'panic_hash') as string;
            if (panicHash) {
                const currentHash = await Integritas.hitungHash({ p: password });
                if (currentHash === panicHash) {
                    await this.destroyAllData();
                    return false;
                }
            }

            const saltHex = await Gudang.get('meta', 'auth_salt') as string;
            const packedValidator = await Gudang.get('meta', 'auth_validator') as string;

            if (!saltHex || !packedValidator) return false;

            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const [ivHex, base64Data] = packedValidator.split('|');
            const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const key = await Brankas.deriveKey(password, salt);
            const decrypted = await Brankas.decrypt(bytes.buffer, iv, key);

            if (decrypted === 'LEMBARAN_SECURED_V2') {
                Brankas.setActiveKey(key);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Unlock failed', e);
            return false;
        }
    },

    async setPanicKey(password: string): Promise<void> {
        const hash = await Integritas.hitungHash({ p: password });
        await Gudang.set('meta', 'panic_hash', hash);
    },

    async destroyAllData(): Promise<void> {
        await Promise.all([
            Gudang.clear('notes'),
            Gudang.clear('folders'),
            Gudang.clear('meta')
        ]);
        if (typeof window !== 'undefined') {
            window.localStorage.clear();
            window.location.href = '/';
        }
    },

    async saveNote(note: Omit<Note, 'updatedAt'>): Promise<Note> {
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

    async getAllNotes(): Promise<Note[]> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const rawNotes = await Gudang.getAll('notes') as Note[];
        const decrypted = await Promise.all(rawNotes.map(async n => {
            try {
                return {
                    ...n,
                    title: await Brankas.decryptPacked(n.title),
                    preview: await Brankas.decryptPacked(n.preview || '')
                };
            } catch (_e) {
                return { ...n, title: '🔒 Terkunci', preview: '🔒 Terkunci' };
            }
        }));
        return decrypted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

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
        } catch (err) {
            console.error('Decryption failed', err);
            return { ...note, content: '⚠️ Gagal Dekripsi Data' };
        }
    },

    async deleteNote(id: EntityId) {
        await Gudang.delete('notes', id);
    },

    async getNoteById(id: EntityId): Promise<Note | undefined> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const note = await Gudang.get('notes', id) as Note;
        if (!note) return undefined;
        return this.decryptNote(note);
    },

    async getStats() {
        try {
            const notesCount = await Gudang.count('notes');
            const foldersCount = await Gudang.count('folders');
            return { notes: notesCount, folders: foldersCount };
        } catch {
            return { notes: 0, folders: 0 };
        }
    }
};

import { Note, Folder, AppSettings, UserProfile } from '../Formula';
import { DBSchema } from 'idb';

export interface LembaranzzSchema extends DBSchema {
    notes: {
        key: string;
        value: Note;
        indexes: { 'updatedAt': string; 'folderId': string };
    };
    folders: {
        key: string;
        value: Folder;
    };
    kv: {
        key: string;
        value: AppSettings | UserProfile | unknown;
    };
    meta: {
        key: string;
        value: unknown;
    };
}

export interface StorageAdapter {
    get<K extends keyof LembaranzzSchema>(store: K, key: string): Promise<LembaranzzSchema[K]['value'] | undefined>;
    set<K extends keyof LembaranzzSchema>(store: K, key: string, value: LembaranzzSchema[K]['value']): Promise<void>;
    getAll<K extends keyof LembaranzzSchema>(store: K): Promise<LembaranzzSchema[K]['value'][]>;
    delete(store: keyof LembaranzzSchema, key: string): Promise<void>;
    count(store: keyof LembaranzzSchema): Promise<number>;
    clear(store: keyof LembaranzzSchema): Promise<void>;
}

import { Note, Folder, AppSettings, UserProfile } from '../Rumus';
import { DBSchema } from 'idb';

export interface LembaranSchema extends DBSchema {
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
    get<K extends keyof LembaranSchema>(store: K, key: string): Promise<LembaranSchema[K]['value'] | undefined>;
    set<K extends keyof LembaranSchema>(store: K, key: string, value: LembaranSchema[K]['value']): Promise<void>;
    getAll<K extends keyof LembaranSchema>(store: K): Promise<LembaranSchema[K]['value'][]>;
    setBulk<K extends keyof LembaranSchema>(store: K, entries: { key: string; value: LembaranSchema[K]['value'] }[]): Promise<void>;
    delete(store: keyof LembaranSchema, key: string): Promise<void>;
    count(store: keyof LembaranSchema): Promise<number>;
    clear(store: keyof LembaranSchema): Promise<void>;
}

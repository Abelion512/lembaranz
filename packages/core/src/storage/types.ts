import { Note, Folder, AppSettings, UserProfile } from '../Formula';
import { DBSchema } from 'idb';

export interface LembaranzSchema extends DBSchema {
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
    get<K extends keyof LembaranzSchema>(store: K, key: string): Promise<LembaranzSchema[K]['value'] | undefined>;
    set<K extends keyof LembaranzSchema>(store: K, key: string, value: LembaranzSchema[K]['value']): Promise<void>;
    getAll<K extends keyof LembaranzSchema>(store: K): Promise<LembaranzSchema[K]['value'][]>;
    delete(store: keyof LembaranzSchema, key: string): Promise<void>;
    count(store: keyof LembaranzSchema): Promise<number>;
    clear(store: keyof LembaranzSchema): Promise<void>;
}

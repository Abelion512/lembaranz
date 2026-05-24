import { openDB, IDBPDatabase } from 'idb';
import { StorageAdapter, LembaranzzSchema } from './types';

const DB_NAME = 'lembaranzz_next';
const DB_VERSION = 1;

export class BrowserAdapter implements StorageAdapter {
    private dbInstance: IDBPDatabase<LembaranzzSchema> | null = null;

    private async initDB(): Promise<IDBPDatabase<LembaranzzSchema>> {
        if (this.dbInstance) return this.dbInstance;

        this.dbInstance = await openDB<LembaranzzSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('notes')) {
                    const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
                    noteStore.createIndex('updatedAt', 'updatedAt');
                    noteStore.createIndex('folderId', 'folderId');
                }
                if (!db.objectStoreNames.contains('folders')) {
                    db.createObjectStore('folders', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('kv')) {
                    db.createObjectStore('kv');
                }
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta');
                }
            },
        });

        return this.dbInstance;
    }

    async get<K extends keyof LembaranzzSchema>(store: K, key: string) {
        const db = await this.initDB();
        return db.get(store as any, key);
    }

    async set<K extends keyof LembaranzzSchema>(store: K, key: string, value: LembaranzzSchema[K]['value']) {
        const db = await this.initDB();
        if (store === 'notes' || store === 'folders') {
            await db.put(store as any, value);
        } else {
            await db.put(store as any, value, key);
        }
    }

    async getAll<K extends keyof LembaranzzSchema>(store: K) {
        const db = await this.initDB();
        return db.getAll(store as any);
    }

    async delete(store: keyof LembaranzzSchema, key: string) {
        const db = await this.initDB();
        await db.delete(store as any, key);
    }

    async count(store: keyof LembaranzzSchema) {
        const db = await this.initDB();
        return db.count(store as any);
    }

    async clear(store: keyof LembaranzzSchema) {
        const db = await this.initDB();
        await db.clear(store as any);
    }
}

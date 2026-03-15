import { openDB, IDBPDatabase } from 'idb';
import { StorageAdapter, LembaranSchema } from './types';

const DB_NAME = 'lembaran_next';
const DB_VERSION = 1;

export class BrowserAdapter implements StorageAdapter {
    private dbInstance: IDBPDatabase<LembaranSchema> | null = null;

    private async initDB(): Promise<IDBPDatabase<LembaranSchema>> {
        if (this.dbInstance) return this.dbInstance;

        this.dbInstance = await openDB<LembaranSchema>(DB_NAME, DB_VERSION, {
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

    async get<K extends keyof LembaranSchema>(store: K, key: string) {
        const db = await this.initDB();
        return db.get(store, key);
    }

    async set<K extends keyof LembaranSchema>(store: K, key: string, value: LembaranSchema[K]['value']) {
        const db = await this.initDB();
        if (store === 'notes' || store === 'folders') {
            await db.put(store, value);
        } else {
            await db.put(store, value, key);
        }
    }

    async getAll<K extends keyof LembaranSchema>(store: K) {
        const db = await this.initDB();
        return db.getAll(store);
    }

    async delete(store: keyof LembaranSchema, key: string) {
        const db = await this.initDB();
        await db.delete(store, key);
    }

    async count(store: keyof LembaranSchema) {
        const db = await this.initDB();
        return db.count(store);
    }

    async clear(store: keyof LembaranSchema) {
        const db = await this.initDB();
        await db.clear(store);
    }
}

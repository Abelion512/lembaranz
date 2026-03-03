import { StorageAdapter, LembaranSchema } from './storage/types';
import { BrowserAdapter } from './storage/BrowserAdapter';

// Singleton instance adapter
let adapter: StorageAdapter;

const getAdapter = async (): Promise<StorageAdapter> => {
    if (adapter) return adapter;

    if (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined') {
        adapter = new BrowserAdapter();
    } else {
        // Dynamic import to avoid 'fs' in browser bundle
        const { FileAdapter } = await import('./storage/FileAdapter');
        adapter = new FileAdapter();
    }
    return adapter;
};

// Re-export Schema for other consumers
export type { LembaranSchema };

export const Gudang = {
    async set<K extends keyof LembaranSchema>(store: K, key: string, value: LembaranSchema[K]['value']) {
        const adp = await getAdapter();
        return adp.set(store, key, value);
    },

    async get<K extends keyof LembaranSchema>(store: K, key: string) {
        const adp = await getAdapter();
        return adp.get(store, key);
    },

    async getAll<K extends keyof LembaranSchema>(store: K) {
        const adp = await getAdapter();
        return adp.getAll(store);
    },

    async delete(store: keyof LembaranSchema, key: string) {
        const adp = await getAdapter();
        return adp.delete(store, key);
    },

    async count(store: keyof LembaranSchema) {
        const adp = await getAdapter();
        return adp.count(store);
    },

    async clear(store: keyof LembaranSchema) {
        const adp = await getAdapter();
        return adp.clear(store);
    }
};

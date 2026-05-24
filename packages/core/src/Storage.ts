import { StorageAdapter, LembaranzzSchema } from './storage/types';
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
export type { LembaranzzSchema };

export const Storage = {
    async initialize(customPath?: string) {
        if (typeof window === 'undefined') {
            const { FileAdapter } = await import('./storage/FileAdapter');
            adapter = new FileAdapter(customPath);
        }
    },

    async set<K extends keyof LembaranzzSchema>(store: K, key: string, value: LembaranzzSchema[K]['value']) {
        const adp = await getAdapter();
        return adp.set(store, key, value);
    },

    async get<K extends keyof LembaranzzSchema>(store: K, key: string) {
        const adp = await getAdapter();
        return adp.get(store, key);
    },

    async getAll<K extends keyof LembaranzzSchema>(store: K) {
        const adp = await getAdapter();
        return adp.getAll(store);
    },

    async delete(store: keyof LembaranzzSchema, key: string) {
        const adp = await getAdapter();
        return adp.delete(store, key);
    },

    async count(store: keyof LembaranzzSchema) {
        const adp = await getAdapter();
        return adp.count(store);
    },

    async clear(store: keyof LembaranzzSchema) {
        const adp = await getAdapter();
        return adp.clear(store);
    }
};

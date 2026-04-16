import { StorageAdapter, LembaranzSchema } from './storage/types';
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
export type { LembaranzSchema };

export const Storage = {
    async initialize(customPath?: string) {
        if (process.env.DEBUG === 'true') {
            console.log(`[STORAGE] Initialize: ${customPath || 'default'}`);
        }
        if (typeof window === 'undefined') {
            const { FileAdapter } = await import('./storage/FileAdapter');
            adapter = new FileAdapter(customPath);
        }
    },

    async set<K extends keyof LembaranzSchema>(store: K, key: string, value: LembaranzSchema[K]['value']) {
        const adp = await getAdapter();
        return adp.set(store, key, value);
    },

    async get<K extends keyof LembaranzSchema>(store: K, key: string) {
        const adp = await getAdapter();
        return adp.get(store, key);
    },

    async getAll<K extends keyof LembaranzSchema>(store: K) {
        const adp = await getAdapter();
        return adp.getAll(store);
    },

    async delete(store: keyof LembaranzSchema, key: string) {
        const adp = await getAdapter();
        return adp.delete(store, key);
    },

    async count(store: keyof LembaranzSchema) {
        const adp = await getAdapter();
        return adp.count(store);
    },

    async clear(store: keyof LembaranzSchema) {
        const adp = await getAdapter();
        return adp.clear(store);
    }
};

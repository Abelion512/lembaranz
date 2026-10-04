/**
 * Storage: the store facade.
 *
 * Picks an adapter by environment, `FileAdapter` in Node and `BrowserAdapter`
 * in the web dashboard, and guarantees a single shared instance. The adapter
 * swap is behind an in-flight promise because the Node path awaits a dynamic
 * import: without it, concurrent first-touches each build their own adapter and
 * each holds a private in-memory copy of the document, so writes through one
 * are invisible to reads through the other.
 *
 * Consumers call `Storage.initialize(path)` once, then use `get` / `set` /
 * `getAll` / `delete` / `count` / `clear` against the four stores.
 */
import { StorageAdapter, LembaranzSchema } from './storage/types';
import { BrowserAdapter } from './storage/BrowserAdapter';

// Singleton instance adapter
let adapter: StorageAdapter;
// Path of the vault currently open, set by `initialize`. Empty until then.
let adapterId = 'default';
// In-flight construction, so concurrent first-touches share one adapter instead
// of each passing the `adapter` check and building their own. The dynamic
// import below is an await, so without this the window is real: Archive
// .restoreBackup drives saveNote in parallel through Promise.all, and two
// FileAdapter instances would each hold a separate in-memory copy of the
// document, so writes through one would be invisible to reads through the other.
let adapterPending: Promise<StorageAdapter> | null = null;

const buildAdapter = async (): Promise<StorageAdapter> => {
    if (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined') {
        return new BrowserAdapter();
    }
    // Dynamic import to avoid 'fs' in browser bundle
    const { FileAdapter } = await import('./storage/FileAdapter');
    return new FileAdapter();
};

const getAdapter = async (): Promise<StorageAdapter> => {
    if (adapter) return adapter;
    if (!adapterPending) {
        adapterPending = buildAdapter().then(
            (created) => {
                adapter = created;
                return created;
            },
            (error) => {
                adapterPending = null;
                throw error;
            }
        );
    }
    return adapterPending;
};

// Re-export Schema for other consumers
export type { LembaranzSchema };

export const Storage = {
    async initialize(customPath?: string) {
        if (typeof window === 'undefined') {
            const { FileAdapter } = await import('./storage/FileAdapter');
            adapter = new FileAdapter(customPath);
            adapterId = customPath ?? 'default';
        }
    },

    /**
     * Identifies the currently-open vault, used to scope rate-limit buckets.
     *
     * A lockout belongs to one vault: failing to unlock `personal` should not
     * lock you out of `project`. It also keeps buckets from bleeding across
     * vaults opened in the same process, which is how a single global key made
     * the test suite order-dependent.
     */
    vaultId(): string {
        return adapterId;
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

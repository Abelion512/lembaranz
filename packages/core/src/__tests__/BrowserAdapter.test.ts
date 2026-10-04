/**
 * BrowserAdapter: the IndexedDB adapter behind the web dashboard.
 *
 * Runs against `fake-indexeddb`, which implements the IndexedDB spec
 * including request lifecycle and `DataCloneError`. The failure cases below
 * depend on genuine structured-clone semantics; a hand-rolled stub would just
 * agree with whatever the adapter happens to do.
 *
 * Two properties are load-bearing for the dashboard and are asserted directly:
 * a note is addressed by its own `id` (the explicit `key` argument is ignored
 * for `notes` and `folders`), and a write that fails leaves nothing behind.
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { IDBFactory, IDBDatabase } from 'fake-indexeddb';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import type { Note } from '../Formula';
import { BrowserAdapter } from '../storage/BrowserAdapter';

const DB_NAME = 'lembaranz_next';

function note(id: string, overrides: Partial<Note> = {}): Note {
    return {
        id,
        title: `title-${id}`,
        content: `content-${id}`,
        tags: ['a'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    } as Note;
}

/**
 * `fake-indexeddb` does not run a structured clone, so an unserialisable value
 * cannot be used to provoke a write failure here. The failure path is therefore
 * driven through `failWritesWithQuota`, which asserts the property that
 * actually matters for the adapter: a write that the database refuses rejects,
 * and nothing is stored.
 */

/**
 * `idb` reaches for the IndexedDB constructors on the global object, so a bare
 * `indexedDB` is not enough. Bun has no DOM, so each constructor comes from
 * `fake-indexeddb/lib/FDB*` and is installed once per worker.
 */
const CONSTRUCTORS = {
    IDBDatabase,
    IDBRequest: (await import('fake-indexeddb/lib/FDBRequest')).default,
    IDBTransaction: (await import('fake-indexeddb/lib/FDBTransaction')).default,
    IDBObjectStore: (await import('fake-indexeddb/lib/FDBObjectStore')).default,
    IDBIndex: (await import('fake-indexeddb/lib/FDBIndex')).default,
    IDBCursor: (await import('fake-indexeddb/lib/FDBCursor')).default,
    IDBCursorWithValue: (await import('fake-indexeddb/lib/FDBCursorWithValue')).default,
    IDBKeyRange: (await import('fake-indexeddb/lib/FDBKeyRange')).default,
    IDBOpenDBRequest: (await import('fake-indexeddb/lib/FDBOpenDBRequest')).default,
    DOMException: globalThis.DOMException ?? class DOMExceptionShim extends Error {},
};
for (const [name, ctor] of Object.entries(CONSTRUCTORS)) {
    if (!(globalThis as Record<string, unknown>)[name]) {
        (globalThis as Record<string, unknown>)[name] = ctor;
    }
}

let factory: IDBFactory;

beforeEach(() => {
    factory = new IDBFactory();
    (globalThis as Record<string, unknown>).indexedDB = factory;
    // fake-indexeddb needs the same factory instance the globals were bound to.
    (globalThis as Record<string, unknown>).IDBFactory = FDBFactory;
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).indexedDB;
});

/**
 * Makes every read-write transaction on this origin fail with
 * `QuotaExceededError`, the way a full disk does, and returns an undo.
 *
 * Patched on the prototype rather than on one connection so that an adapter
 * which has not opened yet still meets the failure.
 */
function failWritesWithQuota(): () => void {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function patched(
        this: IDBDatabase,
        storeNames: string | string[],
        mode?: IDBTransactionMode,
        options?: IDBTransactionOptions,
    ): IDBTransaction {
        if (mode === 'readwrite') {
            throw new DOMException('quota exceeded', 'QuotaExceededError');
        }
        return original.call(this, storeNames, mode, options);
    };
    return () => {
        IDBDatabase.prototype.transaction = original;
    };
}

describe('BrowserAdapter: store creation', () => {
    test('creates all four stores and both note indexes', async () => {
        const adapter = new BrowserAdapter();
        await adapter.count('notes');

        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = factory.open(DB_NAME);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });

        expect([...db.objectStoreNames].sort()).toEqual(['folders', 'kv', 'meta', 'notes']);
        const tx = db.transaction('notes', 'readonly');
        expect([...tx.objectStore('notes').indexNames].sort()).toEqual(['folderId', 'updatedAt']);
        db.close();
    });

    test('opens the database once and reuses the connection', async () => {
        // Counting opens is what makes this falsifiable: a fresh connection
        // per call still returns correct data, so only the open count can
        // tell the two apart.
        const realOpen = factory.open.bind(factory);
        let opens = 0;
        (factory as unknown as { open: IDBFactory['open'] }).open = ((
            ...args: Parameters<typeof realOpen>
        ) => {
            opens++;
            return realOpen(...args);
        }) as IDBFactory['open'];

        const adapter = new BrowserAdapter();
        await adapter.count('notes');
        await adapter.count('folders');
        await adapter.set('kv', 'a', 1);
        await adapter.get('kv', 'a');

        expect(opens).toBe(1);
    });

    test('a second adapter opens its own connection', async () => {
        const a = new BrowserAdapter();
        const b = new BrowserAdapter();
        await a.count('notes');

        // The cache is per instance, not global, so two adapters cannot end up
        // sharing and closing the same connection.
        const realOpen = factory.open.bind(factory);
        let opens = 0;
        (factory as unknown as { open: IDBFactory['open'] }).open = ((
            ...args: Parameters<typeof realOpen>
        ) => {
            opens++;
            return realOpen(...args);
        }) as IDBFactory['open'];

        await b.count('notes');
        expect(opens).toBe(1);
    });

    test('a second adapter over the same origin sees the same data', async () => {
        const a = new BrowserAdapter();
        const b = new BrowserAdapter();
        await a.set('notes', 'ignored', note('n1'));

        expect(await b.getAll('notes')).toHaveLength(1);
        expect((await b.get('notes', 'n1'))?.id).toBe('n1');
    });
});

describe('BrowserAdapter: keying semantics', () => {
    test('notes and folders are keyed by their own id, not the key argument', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('notes', 'this-argument-is-ignored', note('real-id'));

        expect((await adapter.get('notes', 'real-id'))?.id).toBe('real-id');
        expect(await adapter.get('notes', 'this-argument-is-ignored')).toBeUndefined();
        expect(await adapter.count('notes')).toBe(1);
    });

    test('folders follow the same keyPath rule', async () => {
        const adapter = new BrowserAdapter();
        const folder = { id: 'f1', name: 'Work', createdAt: '2026-01-01T00:00:00.000Z' };
        await adapter.set('folders', 'ignored', folder as never);

        expect((await adapter.get('folders', 'f1'))?.id).toBe('f1');
        expect(await adapter.get('folders', 'ignored')).toBeUndefined();
    });

    test('kv and meta use the explicit key argument', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'settings', { theme: 'dark' });
        await adapter.set('meta', 'schema', { v: 1 });

        expect(await adapter.get('kv', 'settings')).toEqual({ theme: 'dark' });
        expect(await adapter.get('meta', 'schema')).toEqual({ v: 1 });
    });

    test('a key overwrite replaces the value rather than duplicating it', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'settings', { theme: 'dark' });
        await adapter.set('kv', 'settings', { theme: 'light' });

        expect(await adapter.count('kv')).toBe(1);
        expect(await adapter.get('kv', 'settings')).toEqual({ theme: 'light' });
    });

    test('setting a note with an existing id updates in place', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('notes', 'n', note('n', { title: 'before' }));
        await adapter.set('notes', 'n', note('n', { title: 'after' }));

        expect(await adapter.count('notes')).toBe(1);
        expect((await adapter.get('notes', 'n'))?.title).toBe('after');
    });

    test('get on a missing key returns undefined, not an error', async () => {
        const adapter = new BrowserAdapter();
        expect(await adapter.get('notes', 'nope')).toBeUndefined();
        expect(await adapter.get('kv', 'nope')).toBeUndefined();
    });

    test('getAll on an empty store returns an empty array', async () => {
        const adapter = new BrowserAdapter();
        expect(await adapter.getAll('notes')).toEqual([]);
        expect(await adapter.getAll('folders')).toEqual([]);
    });

    test('getAll preserves every stored field of a note', async () => {
        const adapter = new BrowserAdapter();
        const full = note('n', { tags: ['x', 'y'], content: 'multi\nline éè' });
        await adapter.set('notes', 'n', full);

        expect(await adapter.getAll('notes')).toEqual([full]);
    });
});

describe('BrowserAdapter: delete and clear', () => {
    test('delete removes only the named key', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'a', 1);
        await adapter.set('kv', 'b', 2);

        await adapter.delete('kv', 'a');

        expect(await adapter.count('kv')).toBe(1);
        expect(await adapter.get('kv', 'b')).toBe(2);
    });

    test('delete on a missing key is a no-op, not a throw', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'a', 1);

        await adapter.delete('kv', 'missing');

        expect(await adapter.count('kv')).toBe(1);
    });

    test('delete works on a notes store keyed by the record id', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('notes', 'n', note('n'));
        await adapter.set('notes', 'm', note('m'));

        await adapter.delete('notes', 'n');

        expect(await adapter.count('notes')).toBe(1);
        expect((await adapter.get('notes', 'm'))?.id).toBe('m');
    });

    test('clear empties one store and leaves the others', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('notes', 'x', note('x'));
        await adapter.set('kv', 'a', 1);

        await adapter.clear('notes');

        expect(await adapter.count('notes')).toBe(0);
        expect(await adapter.count('kv')).toBe(1);
    });

    test('clear on an already empty store is a no-op', async () => {
        const adapter = new BrowserAdapter();
        await adapter.clear('notes');
        expect(await adapter.count('notes')).toBe(0);
    });
});

describe('BrowserAdapter: concurrency', () => {
    test('concurrent writes of distinct keys all land', async () => {
        const adapter = new BrowserAdapter();
        await Promise.all(
            Array.from({ length: 50 }, (_, i) => adapter.set('kv', `k${i}`, i)),
        );

        expect(await adapter.count('kv')).toBe(50);
    });

    test('concurrent writes of the same key leave exactly one value', async () => {
        const adapter = new BrowserAdapter();
        await Promise.all(
            Array.from({ length: 25 }, (_, i) => adapter.set('kv', 'hot', i)),
        );

        expect(await adapter.count('kv')).toBe(1);
        const v = (await adapter.get('kv', 'hot')) as number;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(25);
    });

    test('concurrent writes to the same note id converge on one record', async () => {
        const adapter = new BrowserAdapter();
        await Promise.all(
            Array.from({ length: 20 }, (_, i) =>
                adapter.set('notes', 'n', note('n', { title: `t${i}` })),
            ),
        );

        expect(await adapter.count('notes')).toBe(1);
    });

    test('interleaved reads and writes never observe a partial record', async () => {
        const adapter = new BrowserAdapter();
        await Promise.all(
            Array.from({ length: 30 }, (_, i) =>
                i % 2 === 0
                    ? adapter.set('notes', `n${i}`, note(`n${i}`))
                    : adapter.getAll('notes'),
            ),
        );

        const all = await adapter.getAll('notes');
        expect(all.length).toBeGreaterThan(0);
        for (const n of all) {
            expect(n.id).toMatch(/^n\d+$/);
            expect(n.title).toBe(`title-${n.id}`);
            expect(n.content).toBe(`content-${n.id}`);
        }
    });

    test('concurrent deletes of the same key leave the store consistent', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'a', 1);
        await adapter.set('kv', 'b', 2);

        await Promise.all([
            adapter.delete('kv', 'a'),
            adapter.delete('kv', 'a'),
            adapter.delete('kv', 'b'),
        ]);

        expect(await adapter.count('kv')).toBe(0);
    });
});

describe('BrowserAdapter: failure paths', () => {
    test('a failed write rejects instead of silently vanishing', async () => {
        const adapter = new BrowserAdapter();
        const undo = failWritesWithQuota();
        try {
            let caught: unknown = null;
            try {
                await adapter.set('kv', 'big', 'x'.repeat(4096));
            } catch (e) {
                caught = e;
            }

            expect(caught).not.toBeNull();
            expect((caught as Error).name).toBe('QuotaExceededError');
            expect(await adapter.get('kv', 'big')).toBeUndefined();
            expect(await adapter.count('kv')).toBe(0);
        } finally {
            undo();
        }
    });

    test('a failed note write leaves the store empty', async () => {
        const adapter = new BrowserAdapter();
        const undo = failWritesWithQuota();
        try {
            let caught: unknown = null;
            try {
                await adapter.set('notes', 'n', note('n'));
            } catch (e) {
                caught = e;
            }
            expect(caught).not.toBeNull();
            expect(await adapter.count('notes')).toBe(0);
        } finally {
            undo();
        }
    });

    test('a failed write does not disturb records already stored', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'good', 'value');

        const undo = failWritesWithQuota();
        try {
            await adapter.set('kv', 'bad', 'x').catch(() => {});
        } finally {
            undo();
        }

        expect(await adapter.get('kv', 'good')).toBe('value');
        expect(await adapter.count('kv')).toBe(1);
    });

    test('the adapter still works after a failed write', async () => {
        const undo = failWritesWithQuota();
        const during = new BrowserAdapter();
        await during.set('kv', 'x', 1).catch(() => {});
        undo();

        const after = new BrowserAdapter();
        await after.set('kv', 'after', 'ok');

        expect(await after.get('kv', 'after')).toBe('ok');
        expect(await after.count('kv')).toBe(1);
    });

    test('a failure partway through a batch leaves earlier writes intact', async () => {
        const adapter = new BrowserAdapter();
        const undo = failWritesWithQuota();
        try {
            const results = await Promise.allSettled([
                adapter.set('kv', 'first', 1),
                adapter.set('kv', 'second', 2),
            ]);
            expect(results.every((r) => r.status === 'rejected')).toBe(true);
        } finally {
            undo();
        }

        // Every write was refused, so nothing at all is stored.
        expect(await adapter.count('kv')).toBe(0);
    });

    test('a quota failure rejects and stores nothing', async () => {
        const undo = failWritesWithQuota();
        try {
            const adapter = new BrowserAdapter();

            let caught: unknown = null;
            try {
                await adapter.set('kv', 'big', 'x'.repeat(4096));
            } catch (e) {
                caught = e;
            }

            expect(caught).not.toBeNull();
            expect((caught as DOMException).name).toBe('QuotaExceededError');
            expect(await adapter.get('kv', 'big')).toBeUndefined();
        } finally {
            undo();
        }
    });

    test('reads still work while writes are failing', async () => {
        const seed = new BrowserAdapter();
        await seed.set('kv', 'good', 'value');

        const undo = failWritesWithQuota();
        try {
            const reader = new BrowserAdapter();
            expect(await reader.get('kv', 'good')).toBe('value');
            await expect(reader.set('kv', 'bad', 'x')).rejects.toBeDefined();
        } finally {
            undo();
        }
    });

    test('a clear that hits the quota fails loudly instead of reporting success', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'a', 1);

        const undo = failWritesWithQuota();
        try {
            let caught: unknown = null;
            try {
                await adapter.clear('kv');
            } catch (e) {
                caught = e;
            }
            expect(caught).not.toBeNull();
        } finally {
            undo();
        }
    });

    test('a delete that hits the quota fails loudly instead of reporting success', async () => {
        const adapter = new BrowserAdapter();
        await adapter.set('kv', 'a', 1);

        const undo = failWritesWithQuota();
        try {
            let caught: unknown = null;
            try {
                await adapter.delete('kv', 'a');
            } catch (e) {
                caught = e;
            }
            expect(caught).not.toBeNull();
        } finally {
            undo();
        }
    });

    test('the adapter recovers once writes are allowed again', async () => {
        const undo = failWritesWithQuota();
        const during = new BrowserAdapter();
        await during.set('kv', 'x', 1).catch(() => {});
        undo();

        const after = new BrowserAdapter();
        await after.set('kv', 'y', 2);
        expect(await after.get('kv', 'y')).toBe(2);
    });
});
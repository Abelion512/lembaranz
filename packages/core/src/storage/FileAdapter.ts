/**
 * FileAdapter: the JSON-file storage adapter (Node only).
 *
 * The whole document is held in memory and rewritten on every mutation. Writes
 * go to a temp file with mode `0o600` and are then renamed over the target, so
 * a crash mid-write cannot leave a half-written vault. Two concurrency guards
 * matter:
 *
 *  - `load()` shares one in-flight read. It used to check `this.data` and then
 *    await `readFile`, so concurrent first-touches each built their own
 *    document and the last to resolve discarded the rest: 5 concurrent sets on
 *    a fresh file persisted 1 key.
 *  - `save()` serializes writes and coalesces a burst into a single follow-up
 *    write. Coalescing is bounded on purpose: deferring the flush to a macrotask
 *    was measured at 2.8 ms to 6.6 ms per save, so the write stays immediate.
 *
 * The browser build substitutes `FileAdapter.shim.ts` so bundlers never pull
 * `fs` into the web bundle.
 */
import { StorageAdapter, LembaranzSchema } from "./types";
import fs from "fs/promises";
import path from "path";

const DEFAULT_DB_FILE = "db/data.sqlite";

interface SchemaStructure {
  notes: Record<string, LembaranzSchema["notes"]["value"]>;
  folders: Record<string, LembaranzSchema["folders"]["value"]>;
  kv: Record<string, LembaranzSchema["kv"]["value"]>;
  meta: Record<string, LembaranzSchema["meta"]["value"]>;
}

export class FileAdapter implements StorageAdapter {
  private data: SchemaStructure | null = null;
  private loadPromise: Promise<SchemaStructure> | null = null;
  private filePath: string;
  private savePromise: Promise<void> | null = null;
  private nextSavePromise: Promise<void> | null = null;

  constructor(customPath?: string) {
    // Smart path detection: Custom Path > Environment variable > Current Directory
    const isDebug = typeof process !== 'undefined' && process.env.DEBUG === 'true';
    const envPath = typeof process !== 'undefined' ? process.env.DB_PATH : undefined;
    if (customPath) {
      this.filePath = path.isAbsolute(customPath)
        ? customPath
        : path.resolve(process.cwd(), customPath);
    } else if (envPath) {
      this.filePath = path.isAbsolute(envPath)
        ? envPath
        : path.resolve(process.cwd(), envPath);
    } else {
      const cwd = typeof process !== 'undefined' ? process.cwd() : '';
      this.filePath = path.resolve(cwd, DEFAULT_DB_FILE);
    }
    
    if (isDebug) {
      console.log(`[FILE_ADAPTER] Open: ${this.filePath}`);
    }
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      // 🛡️ Sentinel: Explicitly restrict directory permissions to owner-only
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    } catch (_e) {
      // Directory might already exist
    }
  }

  private load(): Promise<SchemaStructure> {
    if (this.data) return Promise.resolve(this.data);
    // The read is async, so concurrent first-touches all pass the `this.data`
    // check and each build their OWN document; whichever resolves last wins and
    // the rest are silently discarded. Measured: 5 concurrent sets on a fresh
    // file persisted 1 of 5 keys. Archive.restoreBackup drives saveNote through
    // Promise.all in chunks of 50, so this dropped most of a restored backup.
    // Share one in-flight read so every caller gets the same object.
    if (!this.loadPromise) {
      this.loadPromise = this.readFromDisk().finally(() => {
        this.loadPromise = null;
      });
    }
    return this.loadPromise;
  }

  private async readFromDisk(): Promise<SchemaStructure> {

    let content: string;
    try {
      content = await fs.readFile(this.filePath, "utf-8");
    } catch (error) {
      const readError = error as NodeJS.ErrnoException;
      if (readError.code === "ENOENT") {
        // Expected behavior on first run when DB file does not exist yet
        this.data = {
          notes: {},
          folders: {},
          kv: {},
          meta: {},
        };
        return this.data;
      }

      throw new Error(`Failed to read DB file at ${this.filePath}`, {
        cause: error,
      });
    }

    try {
      const parsed = JSON.parse(content);
      this.data = {
        notes: parsed.notes || {},
        folders: parsed.folders || {},
        kv: parsed.kv || {},
        meta: parsed.meta || {},
      };
    } catch (error) {
      throw new Error(`invalid JSON in DB file: ${this.filePath}`, {
        cause: error,
      });
    }

    return this.data!;
  }

/**
 * Serializes whole-document rewrites. Two setters arriving while a write is
 * in flight share one follow-up write rather than queueing one each.
 *
 * ponytail: whole-document rewrite per mutation, O(vault size) per write.
 * ceiling: `saveNote` costs 2 sets (note + audit) x ~1.0 ms on a 435 KB
 * document, and grows linearly with vault size. Coalescing the two sets into
 * one write was implemented and measured at 2.8 ms -> 6.6 ms per save — the
 * macrotask deferral cost more than the rewrite it saved — so the write stays
 * immediate. upgrade path: append-only log for `kv`, or a per-store file, if
 * write cost ever dominates a measured workflow.
 */
  private async save(): Promise<void> {
    if (!this.data) return;

    if (this.savePromise) {
      if (!this.nextSavePromise) {
        this.nextSavePromise = this.savePromise.then(() => {
          this.nextSavePromise = null;
          return this.save();
        });
      }
      return this.nextSavePromise;
    }

    this.savePromise = (async () => {
      const tempPath = `${this.filePath}.tmp`;
      try {
        await this.ensureDirectory();
        // Atomic write: write to temp file first with restrictive permissions, then rename.
        // Compact JSON, not indented: this file is machine-owned state rewritten on every
        // mutation, and the whole-document stringify dominates append cost (~89% measured).
        // Indentation added ~15% bytes and ~33% stringify time for no reader benefit.
        await fs.writeFile(tempPath, JSON.stringify(this.data), {
          encoding: "utf-8",
          mode: 0o600,
        });
        await fs.rename(tempPath, this.filePath);
      } catch (error) {
        // Cleanup temp file if it exists and write failed
        try {
          await fs.unlink(tempPath);
        } catch (_) {
          /* ignore */
        }
        console.error(
          `[FILE_ADAPTER_ERROR] Failed to save to ${this.filePath}:`,
          error
        );
        throw error;
      } finally {
        this.savePromise = null;
      }
    })();

    return this.savePromise;
  }

  async get<K extends keyof LembaranzSchema>(store: K, key: string) {
    const data = await this.load();
    // @ts-expect-error - dynamic store access
    return data[store][key];
  }

  async set<K extends keyof LembaranzSchema>(
    store: K,
    key: string,
    value: LembaranzSchema[K]["value"]
  ) {
    const data = await this.load();

    let actualKey = key;
    if (
      (store === "notes" || store === "folders") &&
      (value as { id?: string }).id
    ) {
      actualKey = (value as { id: string }).id;
    }

    // Security: Block prototype pollution
    if (actualKey === "__proto__" || actualKey === "constructor" || actualKey === "prototype") {
      throw new Error(`[SECURITY] Invalid key detected: ${actualKey}`);
    }

    // @ts-expect-error - dynamic store access
    data[store][actualKey] = value;
    await this.save();
  }

  async getAll<K extends keyof LembaranzSchema>(store: K) {
    const data = await this.load();
    // @ts-expect-error - dynamic store access
    return Object.values(data[store]);
  }

  async delete(store: keyof LembaranzSchema, key: string) {
    const data = await this.load();
    // @ts-expect-error - dynamic store access
    delete data[store][key];
    await this.save();
  }

  async count(store: keyof LembaranzSchema) {
    const data = await this.load();
    // @ts-expect-error - dynamic store access
    return Object.keys(data[store]).length;
  }

  async clear(store: keyof LembaranzSchema) {
    const data = await this.load();
    // @ts-expect-error - dynamic store access
    data[store] = {};
    await this.save();
  }
}

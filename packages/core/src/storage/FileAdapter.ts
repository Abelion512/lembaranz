import { StorageAdapter, LembaranzSchema } from "./types";
import fs from "fs/promises";
import path from "path";

const DEFAULT_DB_FILE = ".lembaranz-db.json";

interface SchemaStructure {
  notes: Record<string, LembaranzSchema["notes"]["value"]>;
  folders: Record<string, LembaranzSchema["folders"]["value"]>;
  kv: Record<string, LembaranzSchema["kv"]["value"]>;
  meta: Record<string, LembaranzSchema["meta"]["value"]>;
}

export class FileAdapter implements StorageAdapter {
  private data: SchemaStructure | null = null;
  private filePath: string;
  private savePromise: Promise<void> | null = null;
  private nextSavePromise: Promise<void> | null = null;

  constructor(customPath?: string) {
    // Smart path detection: Custom Path > Environment variable > Current Directory
    const envPath = process.env.DB_PATH;
    if (customPath) {
      this.filePath = path.isAbsolute(customPath)
        ? customPath
        : path.resolve(process.cwd(), customPath);
    } else if (envPath) {
      this.filePath = path.isAbsolute(envPath)
        ? envPath
        : path.resolve(process.cwd(), envPath);
    } else {
      this.filePath = path.resolve(process.cwd(), DEFAULT_DB_FILE);
    }

    if (process.env.DEBUG === "true") {
      console.log(`[FILE_ADAPTER] Open: ${this.filePath}`);
    }
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (_e) {
      // Directory might already exist
    }
  }

  private async load(): Promise<SchemaStructure> {
    if (this.data) return this.data;

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
        // Atomic write: write to temp file first with restrictive permissions, then rename
        await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2), {
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

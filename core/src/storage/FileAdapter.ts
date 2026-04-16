import { StorageAdapter, LembaranSchema } from './types';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_DB_FILE = '.lembaran-db.json';

interface SchemaStructure {
    notes: Record<string, LembaranSchema['notes']['value']>;
    folders: Record<string, LembaranSchema['folders']['value']>;
    kv: Record<string, LembaranSchema['kv']['value']>;
    meta: Record<string, LembaranSchema['meta']['value']>;
}

export class FileAdapter implements StorageAdapter {
    private data: SchemaStructure | null = null;
    private filePath: string;

    constructor(customPath?: string) {
        // Smart path detection: Custom Path > Environment variable > Current Directory
        const envPath = process.env.DB_PATH;
        if (customPath) {
            this.filePath = path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath);
        } else if (envPath) {
            this.filePath = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
        } else {
            this.filePath = path.resolve(process.cwd(), DEFAULT_DB_FILE);
        }

        if (process.env.DEBUG === 'true') {
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

        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(content);
            this.data = {
                notes: parsed.notes || {},
                folders: parsed.folders || {},
                kv: parsed.kv || {},
                meta: parsed.meta || {}
            };
        } catch (_error) {
            this.data = {
                notes: {},
                folders: {},
                kv: {},
                meta: {}
            };
        }
        return this.data!;
    }

    private async save(): Promise<void> {
        if (!this.data) return;
        const tempPath = `${this.filePath}.tmp`;
        try {
            await this.ensureDirectory();
            // Atomic write: write to temp file first, then rename
            await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
            await fs.rename(tempPath, this.filePath);
        } catch (error) {
            // Cleanup temp file if it exists and write failed
            try { await fs.unlink(tempPath); } catch (_) { /* ignore */ }
            console.error(`[FILE_ADAPTER_ERROR] Failed to save to ${this.filePath}:`, error);
            throw error;
        }
    }

    async get<K extends keyof LembaranSchema>(store: K, key: string) {
        const data = await this.load();
        // @ts-expect-error - dynamic store access
        return data[store][key];
    }

    async set<K extends keyof LembaranSchema>(store: K, key: string, value: LembaranSchema[K]['value']) {
        const data = await this.load();

        let actualKey = key;
        if ((store === 'notes' || store === 'folders') && (value as { id?: string }).id) {
            actualKey = (value as { id: string }).id;
        }

        // @ts-expect-error - dynamic store access
        data[store][actualKey] = value;
        await this.save();
    }

    async getAll<K extends keyof LembaranSchema>(store: K) {
        const data = await this.load();
        // @ts-expect-error - dynamic store access
        return Object.values(data[store]);
    }

    async delete(store: keyof LembaranSchema, key: string) {
        const data = await this.load();
        // @ts-expect-error - dynamic store access
        delete data[store][key];
        await this.save();
    }

    async count(store: keyof LembaranSchema) {
        const data = await this.load();
        // @ts-expect-error - dynamic store access
        return Object.keys(data[store]).length;
    }

    async clear(store: keyof LembaranSchema) {
        const data = await this.load();
        // @ts-expect-error - dynamic store access
        data[store] = {};
        await this.save();
    }
}

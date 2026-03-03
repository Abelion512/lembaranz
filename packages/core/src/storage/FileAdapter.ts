import { StorageAdapter, LembaranSchema } from './types';
import fs from 'node:fs/promises';
import path from 'node:path';

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

    constructor() {
        // Smart path detection: Environment variable > Current Directory
        const envPath = process.env.DB_PATH;
        if (envPath) {
            this.filePath = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
        } else {
            this.filePath = path.resolve(process.cwd(), DEFAULT_DB_FILE);
        }
    }

    private async ensureDirectory(): Promise<void> {
        const dir = path.dirname(this.filePath);
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }
    }

    private async load(): Promise<SchemaStructure> {
        if (this.data) return this.data;

        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(content);
        } catch (error) {
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
        await this.ensureDirectory();
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }

    async get<K extends keyof LembaranSchema>(store: K, key: string) {
        const data = await this.load();
        // @ts-ignore
        return data[store][key];
    }

    async set<K extends keyof LembaranSchema>(store: K, key: string, value: LembaranSchema[K]['value']) {
        const data = await this.load();

        let actualKey = key;
        if ((store === 'notes' || store === 'folders') && (value as any).id) {
            actualKey = (value as any).id;
        }

        // @ts-ignore
        data[store][actualKey] = value;
        await this.save();
        return typeof actualKey === 'string' ? actualKey : String(actualKey);
    }

    async getAll<K extends keyof LembaranSchema>(store: K) {
        const data = await this.load();
        // @ts-ignore
        return Object.values(data[store]);
    }

    async delete(store: keyof LembaranSchema, key: string) {
        const data = await this.load();
        // @ts-ignore
        delete data[store][key];
        await this.save();
    }

    async count(store: keyof LembaranSchema) {
        const data = await this.load();
        // @ts-ignore
        return Object.keys(data[store]).length;
    }

    async clear(store: keyof LembaranSchema) {
        const data = await this.load();
        // @ts-ignore
        data[store] = {};
        await this.save();
    }
}

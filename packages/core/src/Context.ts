import { Result } from './Vault';

export type VaultContext = 'saku' | 'pelataran';

/**
 * Context: Context and Path Resolver.
 * Decoupled from Node.js top-level imports to support browser bundles.
 */
export class Context {
    private static readonly SAKU_FILE = 'saku.json';
    private static readonly PELATARAN_DIR = '.lembaran';
    private static readonly PELATARAN_FILE = 'pelataran.json';

    /**
     * Helper to check if a file or directory exists asynchronously.
     */
    private static async fileExists(p: string): Promise<boolean> {
        try {
            const fs = await import('node:fs/promises');
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Resolves the absolute path for the given context.
     * Works only in Node.js environment.
     */
    static async resolvePath(context: VaultContext): Promise<string> {
        if (typeof window !== 'undefined') return '';

        try {
            // Dynamic imports for ESM/Node compatibility
            const path = await import('path');
            const os = await import('os');
            const fs = await import('node:fs/promises');

            const SAKU_DIR = path.join(os.homedir(), '.lembaran');

            let jalur: string;
            if (context === 'saku') {
                if (!(await this.fileExists(SAKU_DIR))) {
                    await fs.mkdir(SAKU_DIR, { recursive: true });
                }
                jalur = path.join(SAKU_DIR, this.SAKU_FILE);
            } else {
                const root = (await this.findProjectRoot()) || process.cwd();
                const localDir = path.join(root, this.PELATARAN_DIR);
                if (!(await this.fileExists(localDir))) {
                    await fs.mkdir(localDir, { recursive: true });
                }
                jalur = path.join(localDir, this.PELATARAN_FILE);
            }

            if (process.env.DEBUG === 'true') {
                console.log(`[CONTEXT] Path ${context}: ${jalur}`);
            }
            return jalur;
        } catch (err) {
            console.error('[CONTEXT] Gagal menemukan jalur:', err);
            return '';
        }
    }

    /**
     * Detects the project root. Node.js only.
     */
    private static async findProjectRoot(dir: string = (typeof process !== 'undefined' ? process.cwd() : '')): Promise<string | null> {
        if (typeof window !== 'undefined') return null;

        try {
            const path = await import('path');

            const check = async (curr: string): Promise<string | null> => {
                if ((await this.fileExists(path.join(curr, '.git'))) || (await this.fileExists(path.join(curr, 'package.json')))) {
                    return curr;
                }
                const parent = path.dirname(curr);
                if (parent === curr) return null;
                return await check(parent);
            };
            return await check(dir);
        } catch {
            return null;
        }
    }

    /**
     * Smart context detection. Node.js only.
     */
    static async detectContextAuto(): Promise<VaultContext> {
        if (typeof window !== 'undefined') return 'saku';

        try {
            const path = await import('path');

            const root = await this.findProjectRoot();
            if (root && (await this.fileExists(path.join(root, this.PELATARAN_DIR, this.PELATARAN_FILE)))) {
                return 'pelataran';
            }
        } catch {
            // Default to saku on error
        }
        return 'saku';
    }

    /**
     * Reads local .env. Node.js only.
     */
    static async readEnv(): Promise<Record<string, string>> {
        if (typeof window !== 'undefined') return {};

        try {
            const path = await import('path');
            const fs = await import('node:fs/promises');

            const root = await this.findProjectRoot();
            if (!root) return {};
            const envPath = path.join(root, '.env');
            if (!(await this.fileExists(envPath))) return {};

            const content = await fs.readFile(envPath, 'utf8');
            const lines = content.split('\n');
            const env: Record<string, string> = {};

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let val = match[2].trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length - 1);
                    }
                    env[key] = val;
                }
            }
            return env;
        } catch {
            return {};
        }
    }

    /**
     * Writes or updates a local .env variable. Node.js only.
     */
    static async writeEnv(key: string, value: string): Promise<Result<boolean>> {
        if (typeof window !== 'undefined') return { data: null, error: new Error('Bukan lingkungan Node.js') };

        try {
            const path = await import('path');
            const fs = await import('node:fs/promises');

            const root = await this.findProjectRoot();
            if (!root) return { data: null, error: new Error('Akar proyek tidak ditemukan.') };
            const envPath = path.join(root, '.env');

            let content = '';
            if (await this.fileExists(envPath)) {
                content = await fs.readFile(envPath, 'utf8');
            }

            const lines = content.split('\n');
            let found = false;
            const newLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith(`${key}=`)) {
                    found = true;
                    return `${key}=${value}`;
                }
                return line;
            });

            if (!found) {
                if (content.length > 0 && !content.endsWith('\n')) {
                    newLines.push('');
                }
                newLines.push(`${key}=${value}`);
            }

            await fs.writeFile(envPath, newLines.join('\n'), 'utf8');
            return { data: true, error: null };
        } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
}

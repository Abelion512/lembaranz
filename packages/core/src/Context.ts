import { Result } from './Vault';

export type VaultContext = 'personal' | 'project';

/**
 * Context: Context and Path Resolver.
 * Standardizes directory and file naming for personal and project vaults.
 */
export class Context {
    private static readonly PERSONAL_FILE = 'personal.json'; // Legacy: saku.json
    private static readonly PROJECT_DIR = '.lembaranz';
    private static readonly PROJECT_FILE = 'project.json';  // Legacy: pelataran.json

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
     * Includes automatic migration from legacy naming.
     */
    static async resolvePath(context: VaultContext): Promise<string> {
        if (typeof window !== 'undefined') return '';

        try {
            const path = await import('path');
            const os = await import('os');
            const fs = await import('node:fs/promises');

            const PERSONAL_BASE_DIR = path.join(os.homedir(), '.lembaranz');
            let targetPath: string;

            if (context === 'personal') {
                if (!(await this.fileExists(PERSONAL_BASE_DIR))) {
                    await fs.mkdir(PERSONAL_BASE_DIR, { recursive: true });
                }
                
                // MIGRATION: Check for legacy saku.json
                const legacyPath = path.join(PERSONAL_BASE_DIR, 'saku.json');
                const newPath = path.join(PERSONAL_BASE_DIR, this.PERSONAL_FILE);
                
                if (await this.fileExists(legacyPath) && !(await this.fileExists(newPath))) {
                    if (process.env.DEBUG === 'true') console.log('[CONTEXT] Migrating saku.json to personal.json...');
                    await fs.rename(legacyPath, newPath);
                }
                
                targetPath = newPath;
            } else {
                const root = (await this.findProjectRoot()) || process.cwd();
                const localDir = path.join(root, this.PROJECT_DIR);
                if (!(await this.fileExists(localDir))) {
                    await fs.mkdir(localDir, { recursive: true });
                }

                // MIGRATION: Check for legacy pelataran.json
                const legacyPath = path.join(localDir, 'pelataran.json');
                const newPath = path.join(localDir, this.PROJECT_FILE);

                if (await this.fileExists(legacyPath) && !(await this.fileExists(newPath))) {
                    if (process.env.DEBUG === 'true') console.log('[CONTEXT] Migrating pelataran.json to project.json...');
                    await fs.rename(legacyPath, newPath);
                }

                targetPath = newPath;
            }

            if (process.env.DEBUG === 'true') {
                console.log(`[CONTEXT] Resolved ${context} path: ${targetPath}`);
            }
            return targetPath;
        } catch (err) {
            console.error('[CONTEXT] Failed to resolve path:', err);
            return '';
        }
    }

    /**
     * Detects the project root by searching for .git or package.json.
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
     * Smart context detection. Returns 'project' if local configuration exists.
     */
    static async detectContextAuto(): Promise<VaultContext> {
        if (typeof window !== 'undefined') return 'personal';

        try {
            const path = await import('path');
            const root = await this.findProjectRoot();
            
            // Check for both legacy and new project files
            if (root) {
                const hasNew = await this.fileExists(path.join(root, this.PROJECT_DIR, this.PROJECT_FILE));
                const hasLegacy = await this.fileExists(path.join(root, this.PROJECT_DIR, 'pelataran.json'));
                if (hasNew || hasLegacy) return 'project';
            }
        } catch {
            // Default on error
        }
        return 'personal';
    }

    /**
     * Reads local .env file.
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
     * Writes or updates a local .env variable.
     */
    static async writeEnv(key: string, value: string): Promise<Result<boolean>> {
        if (typeof window !== 'undefined') return { data: null, error: new Error('Node.js environment required') };

        try {
            const path = await import('path');
            const fs = await import('node:fs/promises');

            const root = await this.findProjectRoot();
            if (!root) return { data: null, error: new Error('Project root not found') };
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

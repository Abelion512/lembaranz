
export type KonteksLaras = 'saku' | 'pelataran';

/**
 * Laras: Context and Path Resolver.
 * Decoupled from Node.js top-level imports to support browser bundles.
 */
export class Laras {
    private static readonly SAKU_FILE = 'saku.json';
    private static readonly PELATARAN_DIR = '.lembaran';
    private static readonly PELATARAN_FILE = 'pelataran.json';

    /**
     * Resolves the absolute path for the given context.
     * Works only in Node.js environment.
     */
    static async temukanJalur(konteks: KonteksLaras): Promise<string> {
        if (typeof window !== 'undefined') return '';

        // Dynamic imports for ESM/Node compatibility
        const path = await import('node:path');
        const os = await import('node:os');
        const fs = await import('node:fs');

        const SAKU_DIR = path.join(os.homedir(), '.lembaran');

        let jalur: string;
        if (konteks === 'saku') {
            if (!fs.existsSync(SAKU_DIR)) {
                fs.mkdirSync(SAKU_DIR, { recursive: true });
            }
            jalur = path.join(SAKU_DIR, this.SAKU_FILE);
        } else {
            const root = await this.temukanAkarProyek() || process.cwd();
            const localDir = path.join(root, this.PELATARAN_DIR);
            if (!fs.existsSync(localDir)) {
                fs.mkdirSync(localDir, { recursive: true });
            }
            jalur = path.join(localDir, this.PELATARAN_FILE);
        }

        if (process.env.DEBUG === 'true') {
            if (process.env.DEBUG === 'true') console.log(`[LARAS] Jalur ${konteks}: ${jalur}`);
        }
        return jalur;
    }

    /**
     * Detects the project root. Node.js only.
     */
    private static async temukanAkarProyek(dir: string = (typeof process !== 'undefined' ? process.cwd() : '')): Promise<string | null> {
        if (typeof window !== 'undefined') return null;

        const path = await import('node:path');
        const fs = await import('node:fs');

        const check = (curr: string): string | null => {
            if (fs.existsSync(path.join(curr, '.git')) || fs.existsSync(path.join(curr, 'package.json'))) {
                return curr;
            }
            const parent = path.dirname(curr);
            if (parent === curr) return null;
            return check(parent);
        };
        return check(dir);
    }

    /**
     * Smart context detection. Node.js only.
     */
    static async deteksiKonteksOtomatis(): Promise<KonteksLaras> {
        if (typeof window !== 'undefined') return 'saku';

        const path = await import('node:path');
        const fs = await import('node:fs');

        const root = await this.temukanAkarProyek();
        if (root && fs.existsSync(path.join(root, this.PELATARAN_DIR, this.PELATARAN_FILE))) {
            return 'pelataran';
        }
        return 'saku';
    }

    /**
     * Reads local .env. Node.js only.
     */
    static async bacaEnv(): Promise<Record<string, string>> {
        if (typeof window !== 'undefined') return {};

        const path = await import('node:path');
        const fs = await import('node:fs');

        const root = await this.temukanAkarProyek();
        if (!root) return {};
        const envPath = path.join(root, '.env');
        if (!fs.existsSync(envPath)) return {};

        const content = fs.readFileSync(envPath, 'utf8');
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
    }
}

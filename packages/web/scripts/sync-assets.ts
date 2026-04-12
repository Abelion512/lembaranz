import { cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sync() {
    const rootDir = join(__dirname, "../../../");
    const publicDir = join(__dirname, "../public");

    const sources = [
        { from: join(rootDir, "docs"), to: join(publicDir, "docs") },
        { from: join(rootDir, "CHANGELOG.md"), to: join(publicDir, "CHANGELOG.md") },
    ];

    for (const { from, to } of sources) {
        try {
            await cp(from, to, { recursive: true, force: true });
            console.log(`✅ Berhasil syncAssets: ${from} -> ${to}`);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
                console.warn(`⚠️  Sumber tidak ditemukan (abaikan jika opsional): ${from}`);
            } else {
                console.error(`❌ Gagal syncAssets ${from}:`, (err as Error).message);
            }
        }
    }
}

sync();

import fs from 'fs';
import path from 'path';

/**
 * Membaca berkas teks dari berbagai lokasi potensial dalam monorepo.
 * Dirancang untuk bekerja di pengembangan lokal (Bun/Next.js)
 * dan produksi (Vercel Standalone).
 */
export function bacaBerkas(namaBerkas: string): string | null {
    // 1. Dapatkan CWD dan bersihkan path input
    const cwd = process.cwd();
    const cleanPath = namaBerkas.startsWith('/') ? namaBerkas.slice(1) : namaBerkas;

    // 2. Daftar prioritas lokasi pencarian
    const lokasiPencarian = [
        // A. Folder public di dalam paket web (Utama untuk Standalone)
        path.join(cwd, 'public', cleanPath),
        path.join(cwd, 'packages', 'web', 'public', cleanPath),

        // B. Root monorepo (Untuk dev mode dari root)
        path.join(cwd, cleanPath),
        path.join(cwd, '..', '..', cleanPath),

        // C. Fallback khusus untuk Vercel Standalone structure
        // .next/standalone/packages/web/server.js -> public is sibling
        path.join(__dirname, '..', '..', '..', 'public', cleanPath),
    ];

    for (const p of lokasiPencarian) {
        try {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                // console.log(`[bacaBerkas] Berhasil menemukan: ${p}`);
                return fs.readFileSync(p, 'utf8');
            }
        } catch (_e) {
            // Lanjut ke lokasi berikutnya
        }
    }

    // 3. Usaha terakhir: telusuri direktori ke atas (Walk-up)
    let currentDir = cwd;
    for (let i = 0; i < 5; i++) {
        const target = path.join(currentDir, cleanPath);
        const publicTarget = path.join(currentDir, 'public', cleanPath);

        try {
            if (fs.existsSync(target) && fs.statSync(target).isFile()) return fs.readFileSync(target, 'utf8');
            if (fs.existsSync(publicTarget) && fs.statSync(publicTarget).isFile()) return fs.readFileSync(publicTarget, 'utf8');
        } catch (_e) { }

        const parent = path.dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
    }

    console.warn(`[bacaBerkas] ⚠️ Berkas gagal ditemukan setelah pencarian ekstensif: ${namaBerkas}`);
    return null;
}

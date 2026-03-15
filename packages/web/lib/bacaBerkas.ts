import fs from 'fs';
import path from 'path';

/**
 * Membaca berkas teks dari lokasi terbatas untuk keamanan.
 * Dirancang untuk bekerja di pengembangan lokal dan produksi (Vercel Standalone).
 */
export function bacaBerkas(namaBerkas: string): string | null {
    const cwd = process.cwd();
    
    // 1. Normalisasi path untuk mencegah traversal (e.g., ../../)
    const normalizedRelativePath = path.normalize(namaBerkas).replace(/^(\.\.[\\/])+/g, '');
    
    // 2. Batasi akses hanya ke folder dokumentasi atau aset publik tertentu
    if (!normalizedRelativePath.startsWith('docs') &&
        !normalizedRelativePath.startsWith('public')) {
        return null;
    }

    const lokasiPencarian = [
        path.join(cwd, 'public', normalizedRelativePath),
        path.join(cwd, 'packages', 'web', 'public', normalizedRelativePath),
        path.join(cwd, normalizedRelativePath),
        path.join(cwd, '..', '..', 'public', normalizedRelativePath),
        path.join(__dirname, '..', '..', '..', 'public', normalizedRelativePath),
    ];

    for (const p of lokasiPencarian) {
        try {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                return fs.readFileSync(p, 'utf8');
            }
        } catch (_e) { }
    }

    // Usaha terakhir: telusuri direktori ke atas dengan batasan ketat (max 2 level)
    let currentDir = cwd;
    for (let i = 0; i < 2; i++) {
        const target = path.join(currentDir, normalizedRelativePath);
        try {
            if (fs.existsSync(target) && fs.statSync(target).isFile()) return fs.readFileSync(target, 'utf8');
        } catch (_e) { }

        const parent = path.dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
    }

    return null;
}

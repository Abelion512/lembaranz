import fs from 'fs/promises';
import path from 'path';

/**
 * Membaca berkas text dari lokasi terbatas untuk security.
 * Dirancang untuk bekerja di pengembangan lokal dan produksi (Vercel Standalone).
 */
export async function readFile(fileName: string): Promise<string | null> {
    if (!fileName || typeof fileName !== 'string') return null;

    // 0. Hapus null bytes untuk mencegah poisoning
    const safeFileName = fileName.replace(/\0/g, '');

    const cwd = process.cwd();
    
    // 1. Normalisasi path untuk mencegah traversal (e.g., ../../)
    const normalizedRelativePath = path.normalize(safeFileName).replace(/^(\.\.[\\/])+/g, '');
    
    // 2. Batasi akses hanya ke folder dokumentasi atau aset publik tertentu
    // Menggunakan split untuk memastikan kita memeriksa folder utama secara eksak
    const firstPart = normalizedRelativePath.split(/[\\/]/)[0];
    if (firstPart !== 'docs' && firstPart !== 'public') {
        return null;
    }

    const searchLocations = [
        path.join(cwd, 'public', normalizedRelativePath),
        path.join(cwd, 'packages', 'web', 'public', normalizedRelativePath),
        path.join(cwd, normalizedRelativePath),
        path.join(cwd, '..', '..', 'public', normalizedRelativePath),
        path.join(__dirname, '..', '..', '..', 'public', normalizedRelativePath),
    ];

    for (const p of searchLocations) {
        try {
            const stats = await fs.stat(p).catch(() => null);
            if (stats && stats.isFile()) {
                // Validasi tambahan: pastikan berkas yang dibaca memang berada dalam folder 'docs' atau 'public'
                const resolvedPath = path.resolve(p);
                const pathParts = resolvedPath.split(path.sep);
                if (pathParts.includes('docs') || pathParts.includes('public')) {
                    return await fs.readFile(p, 'utf8');
                }
            }
        } catch (_e) {
            // Diabaikan: kegagalan IO pada lokasi pencarian tertentu
        }
    }

    // Usaha terakhir: telusuri direktori ke atas dengan batasan ketat (max 2 level)
    let currentDir = cwd;
    for (let i = 0; i < 2; i++) {
        const target = path.join(currentDir, normalizedRelativePath);
        try {
            const stats = await fs.stat(target).catch(() => null);
            if (stats && stats.isFile()) {
                // Validasi ketat bahwa target tetap berada di dalam struktur yang diizinkan
                const resolvedTarget = path.resolve(target);
                const targetParts = resolvedTarget.split(path.sep);
                if (targetParts.includes('docs') || targetParts.includes('public')) {
                    return await fs.readFile(target, 'utf8');
                }
            }
        } catch (_e) {
            // Diabaikan: kegagalan IO pada traversal direktori
        }

        const parent = path.dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
    }

    return null;
}

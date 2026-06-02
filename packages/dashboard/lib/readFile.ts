import fs from 'fs/promises';
import path from 'path';

/**
 * Reads text files from limited locations for security.
 * Designed to work in local development and production (Vercel Standalone).
 */
export async function readFile(fileName: string): Promise<string | null> {
    if (!fileName || typeof fileName !== 'string') return null;

    // 0. Remove null bytes to prevent poisoning
    const safeFileName = fileName.replace(/\0/g, '');

    const cwd = process.cwd();
    
    // 1. Normalize path to prevent traversal (e.g., ../../)
    const normalizedRelativePath = path.normalize(safeFileName).replace(/^(\.\.[\\/])+/g, '');
    
    // 2. Restrict access only to documentation folder or specific public assets
    // Using split to ensure we check the main folder exactly
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
                // Additional validation: ensure the file being read is indeed within 'docs' or 'public' folder
                const resolvedPath = path.resolve(p);
                const pathParts = resolvedPath.split(path.sep);
                if (pathParts.includes('docs') || pathParts.includes('public')) {
                    return await fs.readFile(p, 'utf8');
                }
            }
        } catch (_e) {
            // Ignored: IO failure at specific search location
        }
    }

    // Last attempt: traverse up directories with strict limits (max 2 levels)
    let currentDir = cwd;
    for (let i = 0; i < 2; i++) {
        const target = path.join(currentDir, normalizedRelativePath);
        try {
            const stats = await fs.stat(target).catch(() => null);
            if (stats && stats.isFile()) {
                // Strict validation that target remains within allowed structure
                const resolvedTarget = path.resolve(target);
                const targetParts = resolvedTarget.split(path.sep);
                if (targetParts.includes('docs') || targetParts.includes('public')) {
                    return await fs.readFile(target, 'utf8');
                }
            }
        } catch (_e) {
            // Ignored: IO failure during directory traversal
        }

        const parent = path.dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
    }

    return null;
}

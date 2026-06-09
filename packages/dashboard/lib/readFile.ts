import fs from 'fs/promises';
import path from 'path';

export async function readFile(fileName: string): Promise<string | null> {
    if (!fileName || typeof fileName !== 'string') return null;

    // 0. Remove null bytes to prevent poisoning
    const safeFileName = fileName.replace(/\0/g, '');

    const cwd = process.cwd();

    // 1. Resolve absolute paths of allowed base directories
    const allowedBases = [
        path.resolve(cwd, 'docs'),
        path.resolve(cwd, 'public'),
        path.resolve(cwd, 'packages', 'web', 'public'),
        path.resolve(cwd, '..', '..', 'public'),
        path.resolve(__dirname, '..', '..', '..', 'public')
    ];

    // 2. Resolve the target path immediately to prevent traversal
    // We try joining cwd and safeFileName. If safeFileName is absolute, path.resolve ignores cwd
    const resolvedTarget = path.resolve(cwd, safeFileName);

    // 3. Ensure the resolved path strictly starts with one of the allowed base directories
    const isAllowed = allowedBases.some(base => {
        // Must ensure we append path.sep to base to avoid partial matches (e.g. docs-fake)
        // Also allow exact match (e.g. reading the folder itself, though fs.readFile will fail, it's safe)
        return resolvedTarget.startsWith(base + path.sep) || resolvedTarget === base;
    });

    if (!isAllowed) {
        return null;
    }

    try {
        const stats = await fs.stat(resolvedTarget).catch(() => null);
        if (stats && stats.isFile()) {
            return await fs.readFile(resolvedTarget, 'utf8');
        }
    } catch (_e) {
        // Ignored
    }

    // Since the original code had multiple search locations based on relative paths,
    // we should iterate through them, resolve, and check against allowed bases.
    // The previous implementation tried different prefixes if it didn't find the file.

    // Let's re-implement the original search logic securely.

    // Normalize path to prevent traversal (e.g., ../../) but preserve relative nature for search
    const normalizedRelativePath = path.normalize(safeFileName).replace(/^(\.\.[\\/])+/g, '');

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
                const resolvedPath = path.resolve(p);
                const isSafe = allowedBases.some(base => resolvedPath.startsWith(base + path.sep) || resolvedPath === base);
                if (isSafe) {
                    return await fs.readFile(p, 'utf8');
                }
            }
        } catch (_e) {
            // Ignored
        }
    }

    // Last attempt: traverse up directories with strict limits (max 2 levels)
    let currentDir = cwd;
    for (let i = 0; i < 2; i++) {
        const target = path.join(currentDir, normalizedRelativePath);
        try {
            const stats = await fs.stat(target).catch(() => null);
            if (stats && stats.isFile()) {
                const resolvedTarget = path.resolve(target);
                const isSafe = allowedBases.some(base => resolvedTarget.startsWith(base + path.sep) || resolvedTarget === base);
                if (isSafe) {
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

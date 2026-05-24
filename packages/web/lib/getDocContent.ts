'use server';

import { readFile } from '@/lib/readFile';

export interface MetadataItem {
    title: string;
    desc: string;
    icon?: string;
    color?: string;
}

// Reserved for future content caching
const _cacheKontenDok: Record<string, string | null> | null = null;
export interface DocChapter {
    title: string;
    items: MetadataItemDetail[];
}

export interface HelpIndex {
    [lang: string]: {
        chapters: DocChapter[];
    };
}

// Reserved for future index caching
const _cacheIndeksBantuan: HelpIndex | null = null;

/**
 * Server Action untuk mengambil content dokumentasi secara dinamis.
 * Mendukung pencarian subfolder (Bab) berdasarkan slug.
 */
export async function getDocContent(slug: string, lang: 'id' | 'en' = 'id') {
    if (!slug || typeof slug !== 'string') return null;

    // Bersihkan slug: hanya izinkan karakter alfanumerik, dash, underscore, dan slash
    const cleanedSlug = slug.trim().replace(/[^a-zA-Z0-9_\-/]/g, '');

    // Pertahanan Path Traversal: Jangan izinkan '..' atau mulai dengan '/'
    if (cleanedSlug.includes('..') || cleanedSlug.startsWith('/')) {
        console.warn(`[getDocContent] Percobaan akses mencurigakan: ${slug}`);
        return null;
    }

    // Cari langsung di folder docs/${lang}/${cleanedSlug}.md
    let content = await readFile(`docs/${lang}/${cleanedSlug}.md`);

    // Fallback ke Bahasa Indonesia jika di Bahasa Inggris tidak ada
    if (!content && lang === 'en') {
        content = await readFile(`docs/id/${cleanedSlug}.md`);
    }

    return content;
}

/**
 * Server Action to get help metadata from docs/indeks.json.
 * Uses in-memory cache for performance.
 */
export interface MetadataItemDetail {
    id: string;
    slug: string;
    title: string;
    description?: string;
    icon?: string;
    children?: MetadataItemDetail[];
}

let helpMetadataCache: HelpIndex | null = null;

export async function getHelpMetadata(lang: 'id' | 'en' = 'id') {
    if (!helpMetadataCache) {
        const raw = await readFile('docs/indeks.json');
        if (!raw) {
            console.error('[getHelpMetadata] Gagal membaca docs/indeks.json');
            return null;
        }
        try {
            helpMetadataCache = JSON.parse(raw);
        } catch (e) {
            console.error('[getHelpMetadata] Error parsing metadata:', e);
            return null;
        }
    }

    return helpMetadataCache![lang] || helpMetadataCache!['id'];
}

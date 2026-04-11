'use server';

import { bacaBerkas } from '@/lib/bacaBerkas';

/**
 * Server Action untuk mengambil konten dokumentasi secara dinamis.
 * Mendukung pencarian subfolder (Bab) berdasarkan slug.
 */
export async function ambilKontenDok(slug: string, lang: 'id' | 'en' = 'id') {
    if (!slug || typeof slug !== 'string') return null;

    // Bersihkan slug: hanya izinkan karakter alfanumerik, dash, underscore, dan slash
    const slugDibersihkan = slug.trim().replace(/[^a-zA-Z0-9_\-/]/g, '');

    // Pertahanan Path Traversal: Jangan izinkan '..' atau mulai dengan '/'
    if (slugDibersihkan.includes('..') || slugDibersihkan.startsWith('/')) {
        console.warn(`[ambilKontenDok] Percobaan akses mencurigakan: ${slug}`);
        return null;
    }

    // Cari langsung di folder docs/[lang]/[slug].md
    let content = bacaBerkas(`docs/${lang}/${slugDibersihkan}.md`);

    // Fallback ke Bahasa Indonesia jika di Bahasa Inggris tidak ada
    if (!content && lang === 'en') {
        content = bacaBerkas(`docs/id/${slugDibersihkan}.md`);
    }

    return content;
}

/**
 * Mengambil metadata untuk halaman bantuan dari docs/indeks.json.
 * Menggunakan cache in-memory untuk meningkatkan performa pembacaan.
 */
export interface ButirMetadata {
    id: string;
    slug: string;
    judul: string;
    deskripsi?: string;
    ikon?: string;
    anak?: ButirMetadata[];
}

let cacheMetadata: Record<string, ButirMetadata[]> | null = null;

export async function ambilMetadataBantuan(lang: 'id' | 'en' = 'id') {
    if (!cacheMetadata) {
        const raw = bacaBerkas('docs/indeks.json');
        if (!raw) {
            console.error('[ambilMetadataBantuan] Gagal membaca docs/indeks.json');
            return null;
        }
        try {
            cacheMetadata = JSON.parse(raw);
        } catch (e) {
            console.error('[ambilMetadataBantuan] Error parsing metadata:', e);
            return null;
        }
    }

    return cacheMetadata![lang] || cacheMetadata!['id'];
}

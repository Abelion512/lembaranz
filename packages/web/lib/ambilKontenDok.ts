'use server';

import { bacaBerkas } from '@/lib/bacaBerkas';

/**
 * Mapping eksplisit slug bantuan untuk keamanan dan konsistensi.
 */
const PETA_SLUG: Record<string, string> = {
    'MULAI_CEPAT': 'MULAI_CEPAT',
    'GETTING_STARTED': 'GETTING_STARTED',
    'cli': 'cli',
    'keamanan': 'keamanan',
    'perintah': 'perintah',
    'performa': 'performa',
    'struktur': 'struktur',
    'publik': 'publik'
};

export interface ButirMetadata {
    title: string;
    desc: string;
    icon: string;
    color: string;
}

export interface IndeksMetadata {
    id: Record<string, ButirMetadata>;
    en: Record<string, ButirMetadata>;
}

// Cache metadata sederhana di level server
let cacheMetadata: IndeksMetadata | null = null;

/**
 * Server Action untuk mengambil konten dokumentasi berdasarkan slug dan bahasa.
 */
export async function ambilKontenDok(slug: string, lang: 'id' | 'en' = 'id') {
    if (!slug || typeof slug !== 'string') return null;

    const slugDibersihkan = slug.trim().replace(/[^a-zA-Z0-9_-]/g, '');

    if (!slugDibersihkan || (slug.length > 4 && slugDibersihkan.length < slug.length / 2)) {
        return null;
    }

    const slugFinal = PETA_SLUG[slugDibersihkan] || slugDibersihkan;

    let content = bacaBerkas(`docs/${lang}/${slugFinal}.md`);

    if (!content && lang === 'en') {
        content = bacaBerkas(`docs/id/${slugFinal}.md`);
    }

    return content;
}

/**
 * Mengambil metadata untuk halaman bantuan dari docs/indeks.json.
 * Menggunakan cache in-memory untuk meningkatkan performa pembacaan.
 */
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

'use server';

import { bacaBerkas } from '@/lib/bacaBerkas';

/**
 * Server Action untuk mengambil konten dokumentasi berdasarkan slug dan bahasa.
 */
export async function ambilKontenDok(slug: string, lang: 'id' | 'en' = 'id') {
    const slugAman = slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');

    if (!slugAman) return null;

    let content = bacaBerkas(`docs/${lang}/${slugAman}.md`);

    // Fallback ke Bahasa Indonesia jika versi Inggris tidak ada
    if (!content && lang === 'en') {
        content = bacaBerkas(`docs/id/${slugAman}.md`);
    }

    return content;
}

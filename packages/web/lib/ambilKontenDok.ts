'use server';

import { bacaBerkas } from '@/lib/bacaBerkas';

/**
 * Server Action untuk mengambil konten dokumentasi berdasarkan slug dan bahasa.
 */
export async function ambilKontenDok(slug: string, lang: 'id' | 'en' = 'id') {
    let content = bacaBerkas(`docs/${lang}/${slug}.md`);

    // Fallback ke Bahasa Indonesia jika versi Inggris tidak ada
    if (!content && lang === 'en') {
        content = bacaBerkas(`docs/id/${slug}.md`);
    }

    return content;
}

'use server';

import { bacaBerkas } from '@/lib/bacaBerkas';

const PETA_SLUG_DOKUMENTASI: Record<string, { id: string; en: string }> = {
    MULAI_CEPAT: { id: 'MULAI_CEPAT', en: 'GETTING_STARTED' },
    GETTING_STARTED: { id: 'MULAI_CEPAT', en: 'GETTING_STARTED' },
    cli: { id: 'cli', en: 'cli' },
    keamanan: { id: 'keamanan', en: 'keamanan' },
    perintah: { id: 'perintah', en: 'perintah' },
    performa: { id: 'performa', en: 'performa' },
    struktur: { id: 'struktur', en: 'struktur' },
    publik: { id: 'publik', en: 'publik' },
};

function slugBerubahTerlaluEkstrem(slugAsli: string, slugAman: string) {
    const panjangAsli = slugAsli.length;
    if (panjangAsli === 0) return true;

    const perubahan = panjangAsli - slugAman.length;
    return perubahan / panjangAsli > 0.4;
}

export function normalisasiSlugDok(slug: string): string | null {
    const slugAsli = slug.trim();
    const slugAman = slugAsli.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!slugAman) {
        console.warn('[ambilKontenDok] slug kosong setelah sanitasi.');
        return null;
    }

    if (slugBerubahTerlaluEkstrem(slugAsli, slugAman)) {
        console.warn('[ambilKontenDok] slug berubah terlalu ekstrem setelah sanitasi.');
        return null;
    }

    if (!PETA_SLUG_DOKUMENTASI[slugAman]) {
        console.warn(`[ambilKontenDok] slug tidak dikenali: ${slugAman}`);
        return null;
    }

    return slugAman;
}

/**
 * Server Action untuk mengambil konten dokumentasi berdasarkan slug dan bahasa.
 */
export async function ambilKontenDok(slug: string, lang: 'id' | 'en' = 'id') {
    const slugDok = normalisasiSlugDok(slug);
    if (!slugDok) return null;

    const pasanganSlug = PETA_SLUG_DOKUMENTASI[slugDok];
    let content = bacaBerkas(`docs/${lang}/${pasanganSlug[lang]}.md`);

    // Fallback ke Bahasa Indonesia jika versi Inggris tidak ada
    if (!content && lang === 'en') {
        content = bacaBerkas(`docs/id/${pasanganSlug.id}.md`);
    }

    return content;
}

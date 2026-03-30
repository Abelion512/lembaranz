'use server';

import { Linguis } from '@lembaranz/core';

// Simple in-memory cache for UI strings to avoid excessive API calls
const cacheUI: Record<string, string> = {};

/**
 * Server Action to get AI-powered translation for a string.
 */
export async function ambilTerjemahan(teks: string, targetLang: 'id' | 'en'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        if (process.env.NODE_ENV === 'development') console.warn('[Linguis] API Key tidak ditemukan (ERR_LNG_001)');
        return teks;
    }

    const cacheKey = `${targetLang}:${teks}`;
    if (cacheUI[cacheKey]) return cacheUI[cacheKey];

    const engine = new Linguis(apiKey);
    const result = await engine.terjemahkanTeks(teks, targetLang);

    cacheUI[cacheKey] = result;
    return result;
}

/**
 * Server Action to get AI-powered translation for documentation.
 */
export async function ambilTerjemahanDokumen(markdown: string, targetLang: 'id' | 'en'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return markdown;

    const engine = new Linguis(apiKey);
    return await engine.terjemahkanDokumen(markdown, targetLang);
}

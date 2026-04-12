'use server';

import { Linguist } from '@lembaranz/core';

// Simple in-memory cache for UI strings to avoid excessive API calls
const cacheUI: Record<string, string> = {};

/**
 * Server Action to get AI-powered translation for a string.
 */
export async function ambilTerjemahan(teks: string, targetLang: 'id' | 'en'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        if (process.env.NODE_ENV === 'development') console.warn('[Linguist] API Key not found (ERR_LNG_001)');
        return teks;
    }

    const cacheKey = `${targetLang}:${teks}`;
    if (cacheUI[cacheKey]) return cacheUI[cacheKey];

    const engine = new Linguist(apiKey);
    const result = await engine.translateText(teks, targetLang);

    cacheUI[cacheKey] = result;
    return result;
}

/**
 * Server Action to get AI-powered translation for documentation.
 */
export async function ambilTerjemahanDokumen(markdown: string, targetLang: 'id' | 'en'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return markdown;

    const engine = new Linguist(apiKey);
    return await engine.translateDocument(markdown, targetLang);
}

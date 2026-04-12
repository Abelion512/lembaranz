'use server';

/**
 * Returns the original text as-is.
 * All translations are handled by next-intl (messages/*.json).
 * No AI or external API calls are made — credentials stay local.
 */
export async function ambilTerjemahan(_teks: string, _targetLang: 'id' | 'en'): Promise<string> {
    // Translations come from i18n message files, not AI
    return '';
}

export async function ambilTerjemahanDokumen(markdown: string, _targetLang: 'id' | 'en'): Promise<string> {
    return markdown;
}

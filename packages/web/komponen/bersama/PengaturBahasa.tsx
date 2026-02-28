'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePundi } from '@lembaran/core/Pundi';

/**
 * Sinkronisasi atribut lang pada elemen html dengan locale aktif dari next-intl.
 * Juga memastikan state lokal (usePundi) tetap selaras dengan URL locale.
 */
export const PengaturBahasa = () => {
    const locale = useLocale();
    const { settings, updateSettings } = usePundi();

    useEffect(() => {
        // 1. Update HTML lang attribute
        const doc = document.documentElement;
        doc.setAttribute('lang', locale);

        // 2. Sinkronkan ke Zustand jika berbeda (untuk kompatibilitas komponen lama)
        if (settings.language !== locale) {
            updateSettings({ language: locale as 'id' | 'en' });
        }
    }, [locale, settings.language, updateSettings]);

    return null;
};

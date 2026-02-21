'use client';

import { useEffect } from 'react';
import { usePundi } from '@lembaran/core/Pundi';

export const PengaturBahasa = () => {
    const language = usePundi(state => state.settings.language);

    useEffect(() => {
        const doc = document.documentElement;
        doc.setAttribute('lang', language);
    }, [language]);

    return null;
};

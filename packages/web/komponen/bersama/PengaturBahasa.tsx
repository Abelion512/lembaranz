'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export const PengaturBahasa = () => {
    const locale = useLocale();

    useEffect(() => {
        document.documentElement.setAttribute('lang', locale);
    }, [locale]);

    return null;
};

'use client';

import { useEffect } from 'react';

export const PengaturSuasana = () => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
    }, []);

    return null;
};

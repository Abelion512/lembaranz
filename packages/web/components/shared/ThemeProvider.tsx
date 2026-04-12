'use client';

import { useEffect } from 'react';

export const ThemeProvider = () => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
    }, []);

    return null;
};

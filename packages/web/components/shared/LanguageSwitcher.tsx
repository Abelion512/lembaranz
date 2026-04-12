'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = () => {
        const newLocale = locale === 'id' ? 'en' : 'id';
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <button
            onClick={switchLocale}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--separator)]/10 hover:border-blue-500/30 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
            aria-label="Ganti bahasa"
        >
            <Languages size={14} />
            <span>{locale === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}</span>
        </button>
    );
}

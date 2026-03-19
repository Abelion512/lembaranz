'use client';

import React, { useEffect, useState } from 'react';
import { Marked } from 'marked';
import { useLocale, useTranslations } from 'next-intl';
import { ambilKontenDok } from '@/lib/ambilKontenDok';
import { ambilTerjemahanDokumen } from '@/lib/ambilTerjemahan';

interface PenerjemahAksaraProps {
    slug: string;
}

// Cache in-memory: key = "slug-lang" → html string
const kontenCache = new Map<string, string>();

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */
const perenderMarkdown = new Marked({ gfm: true });
perenderMarkdown.use({
    renderer: {
        html() {
            return ''; // Blokir eksekusi HTML mentah dalam markdown
        },
        link(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            // Keamanan: Tolak protokol berbahaya (XSS)
            const skemaBerbahaya = /^(javascript|data|vbscript|file):/i;
            if (skemaBerbahaya.test(href)) {
                return `<span>${text}</span>`;
            }

            // Keamanan: Tambahkan atribut pengaman untuk link eksternal
            const isEksternal = href.startsWith('http');
            const rel = isEksternal ? 'rel="noopener noreferrer" target="_blank"' : '';
            const titleAttr = title ? `title="${title}"` : '';

            return `<a href="${href}" ${rel} ${titleAttr}>${text}</a>`;
        }
    }
});

export function PenerjemahAksara({ slug }: PenerjemahAksaraProps) {
    const lang = useLocale() as 'id' | 'en';
    const t = useTranslations('Bantuan');
    const cacheKey = `${slug}-${lang}`;

    const [htmlContent, setHtmlContent] = useState<string | null>(
        () => kontenCache.get(cacheKey) ?? null
    );
    const [loading, setLoading] = useState(!kontenCache.has(cacheKey));
    const [isAITranslated, setIsAITranslated] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadContent = async () => {
            if (kontenCache.has(cacheKey)) {
                const cached = kontenCache.get(cacheKey)!;
                setHtmlContent(cached);
                setLoading(false);
                setIsAITranslated(false);
                return;
            }

            setLoading(true);
            setIsAITranslated(false);

            let content = await ambilKontenDok(slug, lang);

            if (!content && lang === 'en') {
                const idContent = await ambilKontenDok(slug, 'id');
                if (idContent) {
                    content = await ambilTerjemahanDokumen(idContent, 'en');
                    if (!cancelled) setIsAITranslated(true);
                }
            }

            if (cancelled) return;

            if (content) {
                const parsed = await perenderMarkdown.parse(content);
                kontenCache.set(cacheKey, parsed as string);
                setHtmlContent(parsed as string);
            } else {
                setHtmlContent(null);
            }
            setLoading(false);
        };

        loadContent();
        return () => { cancelled = true; };
    }, [slug, lang, cacheKey]);


    if (loading && !htmlContent) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">
                    {t('memuat')}
                </p>
            </div>
        );
    }

    if (!htmlContent) {
        return (
            <div className="p-10 rounded-[3rem] bg-red-500/5 border border-red-500/10 text-red-500">
                <h2 className="text-xl font-bold mb-2">{t('dok_tidak_ditemukan')}</h2>
                <p className="text-sm opacity-70">{t('dok_tidak_dapat_dimuat', { lang, slug })}</p>
            </div>
        );
    }

    return (
        <div className={`relative transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {loading && (
                <div className="absolute top-0 right-0">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                </div>
            )}
            {isAITranslated && (
                <div className="mb-12 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-xs font-medium text-blue-500/80 italic">
                        {lang === 'en'
                            ? "This page has been dynamically translated by Linguis AI."
                            : "Halaman ini diterjemahkan secara dinamis oleh AI Linguis."}
                    </p>
                </div>
            )}
            <div className="prose dark:prose-invert prose-blue max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mb-12
                prose-p:text-lg prose-p:font-normal prose-p:leading-relaxed prose-p:text-[var(--text-secondary)]
                prose-li:font-normal
                prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg
                prose-pre:bg-black/50 prose-pre:backdrop-blur-md prose-pre:border prose-pre:border-white/5 prose-pre:rounded-[2rem] prose-pre:p-8
                prose-strong:text-[var(--text-primary)] prose-strong:font-bold">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
}

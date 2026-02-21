'use client';

import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import { useLocale, useTranslations } from 'next-intl';
import { ambilKontenDok } from '@/lib/ambilKontenDok';
import { ambilTerjemahanDokumen } from '@/lib/ambilTerjemahan';

interface PenerjemahAksaraProps {
    slug: string;
}

// Cache in-memory: key = "slug-lang" → html string
const kontenCache = new Map<string, string>();

export function PenerjemahAksara({ slug }: PenerjemahAksaraProps) {
    const lang = useLocale() as 'id' | 'en';
    const t = useTranslations('Bantuan');
    const cacheKey = `${slug}-${lang}`;

    const [htmlContent, setHtmlContent] = useState<string | null>(
        () => kontenCache.get(cacheKey) ?? null
    );
    const [loading, setLoading] = useState(!kontenCache.has(cacheKey));
    const [isAITranslated, setIsAITranslated] = useState(false);
    const prevHtml = useRef<string | null>(htmlContent);

    useEffect(() => {
        if (kontenCache.has(cacheKey)) {
            setHtmlContent(kontenCache.get(cacheKey)!);
            setLoading(false);
            setIsAITranslated(false);
            return;
        }

        let cancelled = false;

        const loadContent = async () => {
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
                const parsed = await marked.parse(content);
                kontenCache.set(cacheKey, parsed);
                setHtmlContent(parsed);
            } else {
                setHtmlContent(null);
            }
            setLoading(false);
        };

        loadContent();
        return () => { cancelled = true; };
    }, [slug, lang, cacheKey]);

    const displayHtml = loading ? (prevHtml.current ?? htmlContent) : htmlContent;

    useEffect(() => {
        if (!loading && htmlContent) prevHtml.current = htmlContent;
    }, [loading, htmlContent]);

    if (loading && !displayHtml) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">
                    {t('memuat')}
                </p>
            </div>
        );
    }

    if (!displayHtml) {
        return (
            <div className="p-10 rounded-[3rem] bg-red-500/5 border border-red-500/10 text-red-500">
                <h2 className="text-xl font-black mb-2">{t('dok_tidak_ditemukan')}</h2>
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
                prose-headings:font-light prose-headings:tracking-[0.1em] prose-headings:uppercase
                prose-h1:text-4xl prose-h1:mb-12
                prose-p:text-lg prose-p:font-light prose-p:leading-relaxed prose-p:tracking-wide prose-p:text-[var(--text-secondary)]
                prose-li:font-light prose-li:tracking-wide
                prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg
                prose-pre:bg-black/50 prose-pre:backdrop-blur-md prose-pre:border prose-pre:border-white/5 prose-pre:rounded-[2rem] prose-pre:p-8
                prose-strong:text-[var(--text-primary)] prose-strong:font-bold">
                <div dangerouslySetInnerHTML={{ __html: displayHtml }} />
            </div>
        </div>
    );
}

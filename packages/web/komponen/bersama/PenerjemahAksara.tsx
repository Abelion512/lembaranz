'use client';

import React, { useEffect, useState } from 'react';
import { Marked } from 'marked';
import { useLocale, useTranslations } from 'next-intl';
import { ambilKontenDok } from '@/lib/ambilKontenDok';

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

    useEffect(() => {
        let cancelled = false;

        const loadContent = async () => {
            if (kontenCache.has(cacheKey)) {
                const cached = kontenCache.get(cacheKey)!;
                setHtmlContent(cached);
                setLoading(false);
                return;
            }

            setLoading(true);
            const content = await ambilKontenDok(slug, lang);

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


    const contentRef = React.useRef<HTMLDivElement>(null);

    // Pasang tombol salin pada semua blok kode setelah render
    useEffect(() => {
        const el = contentRef.current;
        if (!el || !htmlContent) return;

        const blocks = el.querySelectorAll('pre');
        const cleanups: (() => void)[] = [];

        blocks.forEach((pre) => {
            // Hindari duplikasi tombol
            if (pre.querySelector('.tombol-salin')) return;

            pre.style.position = 'relative';

            const btn = document.createElement('button');
            btn.className = 'tombol-salin';
            btn.title = 'Salin kode';
            btn.setAttribute('aria-label', 'Salin kode');
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
            btn.style.cssText = `
                position:absolute; top:12px; right:12px;
                display:flex; align-items:center; gap:4px;
                padding:4px 10px; border-radius:8px;
                background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1);
                color:rgba(255,255,255,0.6); cursor:pointer; font-size:11px; font-weight:700;
                letter-spacing:0.05em; transition:all 0.2s; z-index:10;
                backdrop-filter:blur(4px);
            `;

            const onClick = () => {
                const code = pre.querySelector('code')?.innerText ?? pre.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin`;
                    btn.style.color = '#34C759';
                    btn.style.borderColor = 'rgba(52,199,89,0.3)';
                    btn.style.background = 'rgba(52,199,89,0.1)';
                    setTimeout(() => {
                        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
                        btn.style.color = 'rgba(255,255,255,0.6)';
                        btn.style.borderColor = 'rgba(255,255,255,0.1)';
                        btn.style.background = 'rgba(255,255,255,0.08)';
                    }, 2000);
                });
            };

            btn.addEventListener('click', onClick);
            pre.appendChild(btn);
            cleanups.push(() => btn.removeEventListener('click', onClick));
        });

        return () => cleanups.forEach(fn => fn());
    }, [htmlContent]);

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
            <div ref={contentRef} className="prose dark:prose-invert prose-blue max-w-none
                prose-headings:font-light prose-headings:tracking-widest prose-headings:uppercase
                prose-h1:text-4xl prose-h1:mb-12
                prose-p:text-lg prose-p:font-light prose-p:leading-relaxed prose-p:tracking-wide prose-p:text-(--text-secondary)
                prose-li:font-light prose-li:tracking-wide
                prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg
                prose-pre:bg-black/50 prose-pre:backdrop-blur-md prose-pre:border prose-pre:border-white/5 prose-pre:rounded-4xl prose-pre:p-8
                prose-strong:text-(--text-primary) prose-strong:font-bold">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
}

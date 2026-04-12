'use client';

import React, { useEffect, useState } from 'react';
import { Marked } from 'marked';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Book, ArrowLeft } from 'lucide-react';
import { getDocContent } from '@/lib/getDocContent';

interface MarkdownRendererProps {
    slug: string;
}

// Cache in-memory: key = "slug-lang" → html string
const contentCache = new Map<string, string>();

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */
const markdownRenderer = new Marked({ gfm: true });
markdownRenderer.use({
    renderer: {
        html() {
            return ''; // Blokir eksekusi HTML mentah dalam markdown
        },
        link(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            // Keamanan: Tolak protokol berbahaya (XSS)
            const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
            if (dangerousSchemes.test(href)) {
                return `<span>${text}</span>`;
            }

            // Keamanan: Tambahkan atribut pengaman untuk link eksternal
            const isExternal = href.startsWith('http');
            const rel = isExternal ? 'rel="noopener noreferrer" target="_blank"' : '';
            // XSS fix: Escape title attribute value
            const safeTitle = title ? title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const titleAttr = safeTitle ? `title="${safeTitle}"` : '';

            return `<a href="${href}" ${rel} ${titleAttr}>${text}</a>`;
        }
    }
});

export function MarkdownRenderer({ slug }: MarkdownRendererProps) {
    const lang = useLocale() as 'id' | 'en';
    const t = useTranslations('Bantuan');
    const cacheKey = `${slug}-${lang}`;

    const [htmlContent, setHtmlContent] = useState<string | null>(
        () => contentCache.get(cacheKey) ?? null
    );
    const [loading, setLoading] = useState(!contentCache.has(cacheKey));

    useEffect(() => {
        let cancelled = false;

        const loadContent = async () => {
            if (contentCache.has(cacheKey)) {
                const cached = contentCache.get(cacheKey)!;
                setHtmlContent(cached);
                setLoading(false);
                return;
            }

            setLoading(true);
            const content = await getDocContent(slug, lang);

            if (cancelled) return;

            if (content) {
                const parsed = await markdownRenderer.parse(content);
                contentCache.set(cacheKey, parsed as string);
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
                    {t('loading')}
                </p>
            </div>
        );
    }

    if (!htmlContent) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-[3rem] bg-(--surface)/30 border border-(--separator)/5 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <Book size={32} strokeWidth={1.5} className="opacity-80" />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tighter text-(--text-primary)">
                    {t('dok_tidak_ditemukan') || 'Lembaran Hilang'}
                </h2>
                <p className="text-sm font-medium text-(--text-muted) max-w-sm leading-relaxed mb-10 opacity-70">
                    Maaf, catatan yang Anda cari tidak ada di brankas kami atau telah dipindahkan ke folder lain.
                </p>
                <Link
                    href="/docs"
                    className="flex items-center gap-3 px-8 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                >
                    <ArrowLeft size={14} />
                    Ke Pusat Bantuan
                </Link>
            </div>
        );
    }

    return (
        <div className={`relative transition-all duration-500 ${loading ? 'opacity-30 scale-[0.98] blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
            <div ref={contentRef} className="prose dark:prose-invert prose-blue max-w-none
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-(--text-primary)
                prose-h1:text-4xl prose-h1:mb-12 prose-h1:leading-tight
                prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-(--separator)/5
                prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                prose-p:text-[16px] prose-p:font-normal prose-p:leading-[1.8] prose-p:tracking-normal prose-p:text-(--text-secondary)
                prose-li:text-(--text-secondary) prose-li:leading-relaxed prose-li:mb-2
                prose-code:text-blue-500 prose-code:bg-blue-500/6 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:border prose-code:border-blue-500/10 prose-code:font-medium prose-code:before:content-[''] prose-code:after:content-['']
                prose-pre:bg-(--surface) prose-pre:backdrop-blur-xl prose-pre:border prose-pre:border-(--separator)/10 prose-pre:rounded-[2.5rem] prose-pre:p-8 prose-pre:shadow-sm
                prose-strong:text-(--text-primary) prose-strong:font-bold
                prose-img:rounded-4xl prose-img:border prose-img:border-(--separator)/10
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500/30 prose-blockquote:bg-blue-500/3 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic select-none">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
}

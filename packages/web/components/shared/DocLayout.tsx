'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, Menu, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { HelpSidebar } from './HelpSidebar';
import { usePathname } from '@/i18n/navigation';

interface DocLayoutProps {
    title?: string;
    description?: string;
    slug?: string;
    children: React.ReactNode;
}

export const DocLayout = ({ title: _title, description: _description, slug, children }: DocLayoutProps) => {
    const t = useTranslations();
    const _pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarTerbuka] = useState(false);

    const closeSidebar = useCallback(() => setSidebarTerbuka(false), []);

    useEffect(() => {
        // Initialize tooltips for all elements with class 'istilah'
        import('tippy.js').then(({ default: tippy }) => {
            tippy('.istilah', {
                arrow: true,
                animation: 'fade',
                theme: 'light-border',
            });
        });
    }, [children]);

    const breadcrumbs = slug ? slug.split('/') : [];

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--background)]">
            {/* Desktop Sidebar (Persistent) */}
            <div className="hidden lg:block">
                <HelpSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={closeSidebar}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--background)] shadow-2xl overflow-y-auto transform transition-transform duration-300 translate-x-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeSidebar}
                            className="absolute top-6 right-6 p-2.5 rounded-2xl hover:bg-[var(--surface)] transition-all bg-[var(--surface)]/50 border border-[var(--separator)]/10"
                            aria-label="Tutup sidebar"
                        >
                            <X size={18} />
                        </button>
                        <HelpSidebar />
                    </div>
                </div>
            )}

            {/* Main Scrollable Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto no-scrollbar scroll-smooth">
                {/* Minimalist Top Nav for Mobile & Search */}
                <header className="sticky top-0 z-30 flex flex-col backdrop-blur-2xl bg-[var(--background)]/85 border-b border-[var(--separator)]/5 transition-all duration-300">
                    <div className="px-6 lg:px-12 py-3.5 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarTerbuka(true)}
                                className="lg:hidden p-2.5 rounded-xl hover:bg-[var(--surface)] transition-all bg-[var(--surface)]/50 border border-[var(--separator)]/10"
                            >
                                <Menu size={18} />
                            </button>

                            {/* Breadcrumbs (GitBook Style) */}
                            <nav className="hidden md:flex items-center gap-3 text-[11px] font-bold tracking-tight text-[var(--text-muted)] lg:ml-0">
                                <Link href="/docs" className="hover:text-blue-500 flex items-center gap-1.5 transition-colors group">
                                    <Home size={13} className="opacity-50 group-hover:opacity-100" />
                                    <span>Bantuan</span>
                                </Link>
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={crumb}>
                                        <ChevronRight size={12} className="opacity-30" />
                                        <span className={`capitalize ${idx === breadcrumbs.length - 1 ? 'text-[var(--text-primary)]' : 'hover:text-blue-500 cursor-pointer transition-colors'}`}>
                                            {crumb.replace(/-/g, ' ').replace(/\d{2}-/g, '')}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </nav>
                        </div>

                        <div className="flex-1 max-w-sm relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder={t('Selasar.Cari')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--surface)]/50 border border-[var(--separator)]/10 rounded-2xl py-2 pl-11 pr-4 text-[12px] font-medium outline-none focus:border-blue-500/30 focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)]/50"
                            />
                        </div>

                        <div className="hidden sm:flex items-center gap-4">
                            <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-[var(--surface)] transition-all border border-[var(--separator)]/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                <Search size={18} className="rotate-90 hidden" /> {/* Placeholder icon */}
                                <div className="w-5 h-5 rounded-md bg-[var(--text-primary)]/10 flex items-center justify-center font-black text-[8px] text-[var(--text-primary)]">v1</div>
                            </a>
                        </div>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-20 py-12 lg:py-20 flex flex-col">
                    <div className="flex-1 space-y-16">
                        <section className="prose prose-invert max-w-none prose-headings:tracking-tighter prose-h1:text-4xl prose-h1:font-black prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:text-[15px] prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-[var(--text-primary)] prose-code:text-blue-400 prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--separator)]/10 prose-pre:rounded-3xl">
                            {children}
                        </section>
                    </div>

                    {/* Pagination Bottom (GitBook Style) */}
                    <div className="mt-32 pt-10 border-t border-[var(--separator)]/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <Link href="/docs" className="flex items-center gap-4 group p-4 rounded-2xl hover:bg-[var(--surface)] transition-all border border-transparent hover:border-[var(--separator)]/10">
                            <div className="w-10 h-10 rounded-full border border-[var(--separator)]/10 flex items-center justify-center text-[var(--text-muted)] group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Kembali</span>
                                <span className="text-sm font-bold text-[var(--text-primary)]">Halaman Bantuan</span>
                            </div>
                        </Link>

                        <div className="text-center sm:text-right">
                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]/40 mb-2">
                                {t('Kemudi.HakCipta')}
                            </p>
                            <div className="flex items-center justify-center sm:justify-end gap-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]/60">
                                <Link href="/privacy" className="hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">{t('Kemudi.Privasi')}</Link>
                                <span className="w-1 h-1 rounded-full bg-[var(--separator)]/20" />
                                <Link href="/terms" className="hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">{t('Kemudi.Ketentuan')}</Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { SaklarSuasana } from '@/komponen/landing/SaklarSuasana';
import { Link } from '@/i18n/navigation';
import { SelasarBantuan } from './SelasarBantuan';

interface LembaranDokProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export const LembaranDok = ({ title: _title, description: _description, children }: LembaranDokProps) => {
    const t = useTranslations();
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarTerbuka, setSidebarTerbuka] = useState(false);

    const tutupSidebar = useCallback(() => setSidebarTerbuka(false), []);

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

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar scroll-smooth bg-[var(--background)]">
            {/* Mobile Sidebar Overlay */}
            {sidebarTerbuka && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={tutupSidebar}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Panel Sidebar */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--background)] shadow-2xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={tutupSidebar}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface)] transition-colors"
                            aria-label="Tutup sidebar"
                        >
                            <X size={20} />
                        </button>
                        <SelasarBantuan />
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-30 flex flex-col backdrop-blur-xl bg-[var(--background)]/60 border-b border-[var(--separator)]/5 transition-colors duration-500">
                {/* Main Header */}
                <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                L
                            </div>
                            <span className="font-bold tracking-tighter text-xl decoration-blue-500/30">Lembaran</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-8">
                            <Link href="/pustaka" className="hover:text-blue-500 transition-colors">{t('Selasar.Produk')}</Link>
                            <Link href="/bantuan" className="hover:text-blue-500 transition-colors">{t('Selasar.Bantuan')}</Link>
                            <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md mx-4 relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                        <input
                            type="text"
                            placeholder={t('Selasar.Cari')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--surface)]/50 border border-[var(--separator)]/5 rounded-full py-2.5 pl-11 pr-4 text-xs font-medium outline-none focus:border-blue-500/30 focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)]/50"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <SaklarSuasana />
                        <Link href="/pustaka" className="hidden sm:flex px-6 py-2.5 bg-[#text-primary] bg-blue-500 text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-all hover:bg-blue-600">
                            {t('Aksi.BukaBrankas')}
                        </Link>
                    </div>
                </div>

                {/* Sub-Header Navigation (GitBook Style) */}
                <nav className="px-8 border-t border-[var(--separator)]/5 flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {[
                        { label: t('Selasar.Dokumentasi'), href: '/bantuan' },
                        { label: 'Platform', href: '/bantuan/struktur' },
                        { label: 'Quick Start', href: '/bantuan/MULAI_CEPAT' },
                        { label: t('Selasar.Changelog'), href: '/versi' },
                        { label: t('Selasar.Keamanan'), href: '/bantuan/keamanan' },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-blue-500 border-b-2 border-transparent hover:border-blue-500 transition-all whitespace-nowrap active:opacity-50"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="max-w-4xl w-full px-4 py-8 sm:py-12 lg:px-12 mx-auto">
                <div className="space-y-20">
                    {children}
                </div>

                <footer className="mt-40 pt-12 pb-12 border-t border-[var(--separator)]/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]/40">
                        {t('Kemudi.HakCipta')}
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]/60">
                         <Link href="/privasi" className="hover:text-blue-500 transition-colors">{t('Kemudi.Privasi')}</Link>
                         <Link href="/ketentuan" className="hover:text-blue-500 transition-colors">{t('Kemudi.Ketentuan')}</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
};

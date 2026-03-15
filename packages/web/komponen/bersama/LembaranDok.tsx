'use client';

import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { SaklarSuasana } from '@/komponen/landing/SaklarSuasana';
import { Link } from '@/i18n/navigation';
import { SelasarBantuan } from './SelasarBantuan';

interface LembaranDokProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export const LembaranDok = ({ title, description, children }: LembaranDokProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarTerbuka, setSidebarTerbuka] = useState(false);

    const tutupSidebar = useCallback(() => setSidebarTerbuka(false), []);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar scroll-smooth">
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

            <header className="sticky top-0 z-30 flex flex-col backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--separator)]/10">
                {/* Main Header */}
                <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                                L
                            </div>
                            <span className="font-bold tracking-tighter text-lg">Lembaran</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-4">
                            <Link href="/pustaka" className="hover:text-blue-500 transition-colors">Produk</Link>
                            <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                            <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg mx-8 relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                        <input
                            type="text"
                            placeholder="Cari dokumentasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--surface)] border border-[var(--separator)]/10 rounded-full py-2.5 pl-12 pr-4 text-xs font-medium outline-none focus:border-blue-500/30 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <SaklarSuasana />
                        <Link href="/pustaka" className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            Buka Brankas
                        </Link>
                    </div>
                </div>

                {/* Sub-Header Navigation (GitBook Style) */}
                <nav className="px-8 border-t border-[var(--separator)]/5 flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {[
                        { label: 'Dokumentasi', href: '/bantuan' },
                        { label: 'Pengembang', href: '/bantuan/struktur' },
                        { label: 'Panduan', href: '/bantuan/MULAI_CEPAT' },
                        { label: 'Changelog', href: '/versi' },
                        { label: 'Keamanan', href: '/bantuan/keamanan' },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-blue-500 border-b-2 border-transparent hover:border-blue-500 transition-all whitespace-nowrap"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="max-w-4xl w-full px-6 py-12 sm:py-20 lg:px-20">
                <div className="mb-16">
                    <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-6">{title}</h1>
                    <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">{description}</p>
                </div>

                <div className="space-y-20">
                    {children}
                </div>

                <footer className="mt-40 pt-12 border-t border-[var(--separator)]/10">
                    <p className="text-[10px] font-light uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        © 2026 Lembaran Documentation Engine.
                    </p>
                </footer>
            </main>
        </div>
    );
};

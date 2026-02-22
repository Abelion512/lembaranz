'use client';

import React, { useState, useCallback } from 'react';
import { Search, Menu, X } from 'lucide-react';
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

            <header className="sticky top-0 z-30 p-4 sm:p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--separator)]/10">
                <div className="lg:hidden flex items-center gap-4">
                    <button
                        onClick={() => setSidebarTerbuka(true)}
                        className="p-2 bg-[var(--surface)] rounded-xl border border-[var(--separator)]/10 active:scale-95 transition-transform"
                        aria-label="Buka navigasi"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 max-w-md mx-4 relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Cari di halaman ini..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--separator)]/20 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SaklarSuasana />
                    <Link href="/pustaka" className="px-5 py-2 bg-blue-500 text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">
                        Buka Brankas
                    </Link>
                </div>
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

'use client';

import React from 'react';
import Link from 'next/link';
import {
    Book, Shield, Zap, Rocket,
    Database, Github,
    Command, Download,
    ChevronRight, ExternalLink,
    ChevronLeft
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { usePathname } from 'next/navigation';

const SECTIONS = [
    {
        title: 'Pengenalan',
        items: [
            { id: '', label: 'Ringkasan', icon: Book },
            { id: 'publik', label: 'Mulai Berdikari', icon: Rocket },
            { id: 'keamanan', label: 'Keamanan', icon: Shield },
            { id: 'performa', label: 'Performa', icon: Zap },
        ]
    },
    {
        title: 'Instalasi',
        items: [
            { id: 'cli', label: 'Pasang CLI', icon: Download },
        ]
    },
    {
        title: 'Referensi',
        items: [
            { id: 'perintah', label: 'Daftar Perintah', icon: Command },
            { id: 'struktur', label: 'Struktur Data', icon: Database },
        ]
    },
];

export const SidebarBantuan = () => {
    const pathname = usePathname();

    const isActive = (id: string) => {
        const fullPath = id === '' ? '/bantuan' : `/bantuan/${id}`;
        return pathname === fullPath;
    };

    return (
        <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 bg-[var(--background)] border-r border-[var(--separator)]/10 p-8 overflow-y-auto no-scrollbar z-40">
            <div className="flex flex-col gap-10">
                <Link href="/" onClick={() => haptic.light()} className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                    <ChevronLeft size={16} /> Kembali ke Beranda
                </Link>

                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Book size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tighter uppercase leading-none">Dokumentasi</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Pusat Bantuan</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 space-y-10">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-5 ml-4">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.id === '' ? '/bantuan' : `/bantuan/${item.id}`}
                                    onClick={() => haptic.light()}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left group ${isActive(item.id)
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                                            : 'text-[var(--text-secondary)] hover:bg-blue-500/5 hover:text-blue-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className={isActive(item.id) ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 transition-opacity'} />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className={isActive(item.id) ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all'} />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-12 space-y-3">
                <a
                    href="https://github.com/Abelion512/lembaran"
                    target="_blank"
                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Github size={16} />
                        <span>GitHub</span>
                    </div>
                    <ExternalLink size={14} />
                </a>
            </div>
        </aside>
    );
};

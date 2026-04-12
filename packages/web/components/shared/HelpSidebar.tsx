'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import {
    Book, Shield, Zap, Rocket,
    Database, Github,
    Command, Download,
    ExternalLink, Globe,
    ChevronLeft
} from 'lucide-react';
import { haptic } from '@lembaranz/core/Senses';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export const HelpSidebar = () => {
    const _t = useTranslations();
    const pathname = usePathname();

    const SECTIONS = [
        {
            title: 'Mulai',
            items: [
                { id: '01-mulai/berdikari', label: 'Mulai Berdikari', icon: Globe },
                { id: '01-mulai/cepat', label: 'Cepat Saji', icon: Rocket },
                { id: '01-mulai/pasang', label: 'Instalasi CLI', icon: Download },
            ]
        },
        {
            title: 'Fitur',
            items: [
                { id: '02-fitur/cli', label: 'Antarmuka TUI', icon: Command },
                { id: '02-fitur/security', label: 'Keamanan Absolut', icon: Shield },
                { id: '02-fitur/performa', label: 'Optimasi Performa', icon: Zap },
            ]
        },
        {
            title: 'Referensi',
            items: [
                { id: '03-referensi/command', label: 'Daftar Perintah', icon: Book },
                { id: '03-referensi/arsitektur', label: 'Arsitektur Data', icon: Database },
            ]
        },
    ];

    const isActive = (id: string) => {
        return pathname === `/help/${id}`;
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-(--background) border-r border-(--separator)/10 p-8 overflow-y-auto no-scrollbar z-40">
            <div className="flex flex-col gap-10">
                <Link href="/" onClick={() => haptic.light()} className="flex items-center gap-2 text-(--text-muted) font-bold text-[9px] uppercase tracking-[0.3em] hover:text-blue-500 transition-all duration-300">
                    <ChevronLeft size={12} strokeWidth={3} /> Beranda
                </Link>

                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm border border-blue-500/20">
                        <Book size={18} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-black text-[12px] uppercase tracking-[0.2em] leading-tight text-(--text-primary)">Lembaran</h2>
                        <span className="text-[9px] font-medium text-(--text-muted) uppercase tracking-widest mt-1 opacity-70">Dokumentasi</span>
                    </div>
                </div>
            </div>

            <nav className="mt-12 space-y-10">
                {SECTIONS.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h3 className="text-[9px] font-black text-(--text-muted) uppercase tracking-[0.25em] ml-4 opacity-50">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/docs/${item.id}`}
                                    onClick={() => haptic.light()}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-left group ${isActive(item.id)
                                        ? 'bg-blue-500/8 text-blue-500 font-bold border border-blue-500/10'
                                        : 'text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary)'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={16} strokeWidth={ isActive(item.id) ? 2.5 : 2 } className={isActive(item.id) ? 'text-blue-500' : 'text-(--text-muted) group-hover:text-blue-500 transition-colors'} />
                                        <span className="text-[13px] tracking-tight">{item.label}</span>
                                    </div>
                                    {isActive(item.id) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto pt-16">
                <a
                    href="https://github.com/Abelion512/lembaran"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-5 py-4 rounded-3xl bg-(--surface) border border-(--separator)/10 text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white ring-4 ring-black/5">
                            <Github size={16} />
                        </div>
                        <span className="text-(--text-primary) tracking-tight">GitHub Repo</span>
                    </div>
                    <ExternalLink size={14} className="text-(--text-muted) group-hover:text-blue-500 transition-colors" />
                </a>
            </div>
        </aside>
    );
};

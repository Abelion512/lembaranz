'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import {
    Book, Shield, Zap, Rocket,
    Database, Github,
    Command, Download,
    ExternalLink,
    ChevronLeft
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export const SelasarBantuan = () => {
    const t = useTranslations();
    const pathname = usePathname();

    const SECTIONS = [
        {
            title: t('Selasar.Pengenalan') || 'Pengenalan',
            items: [
                { id: '', label: t('Selasar.Ringkasan') || 'Ringkasan', icon: Book },
                { id: 'publik', label: t('Selasar.Berdikari') || 'Mulai Berdikari', icon: Rocket },
                { id: 'keamanan', label: t('Selasar.Keamanan') || 'Keamanan', icon: Shield },
                { id: 'performa', label: t('Selasar.Performa') || 'Performa', icon: Zap },
            ]
        },
        {
            title: t('Selasar.Instalasi') || 'Instalasi',
            items: [
                { id: 'cli', label: t('Selasar.PasangCLI') || 'Pasang CLI', icon: Download },
            ]
        },
        {
            title: t('Selasar.Referensi') || 'Referensi',
            items: [
                { id: 'perintah', label: t('Selasar.DaftarPerintah') || 'Daftar Perintah', icon: Command },
                { id: 'struktur', label: t('Selasar.StrukturData') || 'Struktur Data', icon: Database },
            ]
        },
    ];

    const isActive = (id: string) => {
        const fullPath = id === '' ? '/bantuan' : `/bantuan/${id}`;
        return pathname === fullPath;
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[var(--background)] border-r border-[var(--separator)]/10 p-6 overflow-y-auto no-scrollbar z-40">
            <div className="flex flex-col gap-8">
                <Link href="/" onClick={() => haptic.light()} className="flex items-center gap-2 text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">
                    <ChevronLeft size={14} /> Beranda
                </Link>

                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                        <Book size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-widest leading-none">Dokumentasi</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 space-y-8">
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
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left group ${isActive(item.id)
                                        ? 'bg-blue-500/5 text-blue-500 font-bold'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className={isActive(item.id) ? 'text-blue-500' : 'text-[var(--text-muted)] group-hover:text-blue-500 transition-colors'} />
                                        <span className="text-xs tracking-tight">{item.label}</span>
                                    </div>
                                    {isActive(item.id) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-12 space-y-3">
                <a
                    href="https://github.com/Abelion512/lembaran"
                    target="_blank" rel="noopener noreferrer"
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

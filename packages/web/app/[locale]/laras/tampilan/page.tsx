'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Sun, Moon, Monitor, Check } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { haptic } from '@lembaran/core/Indera';

export default function AppearanceManagementPage() {
    const { settings, updateSettings } = usePundi();

    const setTheme = (theme: 'light' | 'dark' | 'auto') => {
        haptic.light();
        updateSettings({ theme });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight">Tampilan</h1>

            <h2 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] px-4 mb-3">Tema Aplikasi</h2>
            <div className="ios-list-group mb-8">
                <button onClick={() => setTheme('light')} className="ios-list-item w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-yellow-500 text-white flex items-center justify-center shadow-sm">
                            <Sun size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Terang</span>
                    </div>
                    {settings.theme === 'light' && <Check size={18} className="text-[var(--primary)]" />}
                </button>
                <div className="ios-separator"></div>
                <button onClick={() => setTheme('dark')} className="ios-list-item w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                            <Moon size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Gelap</span>
                    </div>
                    {settings.theme === 'dark' && <Check size={18} className="text-[var(--primary)]" />}
                </button>
                <div className="ios-separator"></div>
                <button onClick={() => setTheme('auto')} className="ios-list-item w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-slate-500 text-white flex items-center justify-center shadow-sm">
                            <Monitor size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Otomatis (Sistem)</span>
                    </div>
                    {settings.theme === 'auto' && <Check size={18} className="text-[var(--primary)]" />}
                </button>
            </div>

            <p className="text-[13px] text-[var(--text-secondary)] px-4 opacity-70">
                Pilih suasana yang paling nyaman untuk mata Anda saat menyusun fragmen memori.
            </p>
        </div>
    );
}

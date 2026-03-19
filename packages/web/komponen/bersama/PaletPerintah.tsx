'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FilePlus, Settings, User, Command } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export const PaletPerintah = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    const togglePalette = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                togglePalette();
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePalette]);

    const actions = [
        { icon: FilePlus, label: 'Catatan Baru', path: '/tambah', shortcut: 'N' },
        { icon: Search, label: 'Cari Catatan', path: '/cari', shortcut: '/' },
        { icon: User, label: 'Profil Jatidiri', path: '/jatidiri', shortcut: 'P' },
        { icon: Settings, label: 'Setelan Laras', path: '/laras', shortcut: ',' },
    ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

    const navigate = (path: string) => {
        router.push(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -20 }}
                        className="w-full max-w-lg glass-card shadow-xl border-white/20 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-[var(--separator)]">
                            <Search size={20} className="text-[var(--text-secondary)] mr-3" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari perintah atau fitur..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-base py-1"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/10">
                                <Command size={10} className="opacity-50" />
                                <span className="text-[10px] font-bold opacity-50">K</span>
                            </div>
                        </div>

                        <div className="p-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {actions.length > 0 ? (
                                actions.map((action) => (
                                    <button
                                        key={action.path}
                                        onClick={() => navigate(action.path)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl active:bg-white/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-active:bg-primary group-active:text-white transition-colors">
                                                <action.icon size={18} />
                                            </div>
                                            <span className="font-medium text-sm">{action.label}</span>
                                        </div>
                                        <span className="text-[10px] font-bold opacity-30 group-active:opacity-60">{action.shortcut}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center opacity-30">
                                    <p className="text-sm font-medium">Perintah tidak ditemukan</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-white/5 border-t border-[var(--separator)] flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Lembaran Quick Command</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 opacity-40">
                                    <span className="text-[10px] font-bold px-1 rounded border border-white/20 bg-white/5">ESC</span>
                                    <span className="text-[9px]">Tutup</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

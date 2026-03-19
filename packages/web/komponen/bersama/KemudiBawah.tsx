'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
    Home, Search, User, Settings, Plus, WifiOff,
    FileText, ShieldCheck, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@lembaran/core/Indera';

const NAV_ITEMS = [
    { icon: Home, label: 'Gudang', path: '/pustaka' },
    { icon: Search, label: 'Jelajah', path: '/cari' },
    { icon: Plus, label: 'Ukir', path: '/tambah', isFab: true },
    { icon: User, label: 'Jatidiri', path: '/jatidiri' },
    { icon: Settings, label: 'Laras', path: '/laras' },
];

export const KemudiBawah = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        haptic.medium();
    };

    const handleQuickAction = (path: string) => {
        setIsMenuOpen(false);
        haptic.light();
        router.push(path);
    };

    return (
        <div className="kemudi-bawah fixed bottom-0 left-0 right-0 p-4 pb-8 flex flex-col items-center z-[100] pointer-events-none">
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-3 px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                    >
                        <WifiOff size={10} />
                        MODE LURING
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Capture Menu Expansion */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            role="menu"
                            aria-label="Aksi Cepat Catatan"
                            className="glass-card mb-6 p-2 rounded-[2rem] shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-1 min-w-[200px]"
                        >
                            <button
                                role="menuitem"
                                onClick={() => handleQuickAction('/tambah')}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl transition-colors active:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Catatan Teks</p>
                                    <p className="text-[10px] opacity-50">Tulis ide atau jurnal</p>
                                </div>
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => handleQuickAction('/tambah?mode=credentials')}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl transition-colors active:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Kredensial</p>
                                    <p className="text-[10px] opacity-50">Simpan akun & password</p>
                                </div>
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => handleQuickAction('/tambah?mode=checklist')}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl transition-colors active:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <CheckSquare size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Log & Tugas</p>
                                    <p className="text-[10px] opacity-50">Developer log / to-do</p>
                                </div>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <nav
                aria-label="Navigasi Utama"
                className="glass-card flex items-center justify-around gap-2 px-6 py-3 min-w-[320px] max-w-lg w-full pointer-events-auto rounded-full shadow-lg border border-white/20 relative !overflow-visible"
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <button
                                key={item.label}
                                onClick={toggleMenu}
                                aria-label="Menu Aksi Cepat"
                                aria-expanded={isMenuOpen}
                                aria-haspopup="menu"
                                className="relative z-10"
                            >
                                <motion.div
                                    animate={{ rotate: isMenuOpen ? 45 : 0 }}
                                    className={`w-14 h-14 -mt-10 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-[var(--background)] transition-colors ${isMenuOpen ? 'bg-red-500' : 'bg-blue-500'}`}
                                >
                                    <Plus size={28} />
                                </motion.div>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => !isActive && haptic.light()}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className="relative p-2 active:opacity-60 transition-opacity group"
                        >
                            <Icon
                                size={26}
                                className={`transition-colors duration-300 ${isActive ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
                            />
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

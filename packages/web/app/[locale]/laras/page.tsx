'use client';

import { Link } from '@/i18n/navigation';
import { haptic } from '@lembaran/core/Indera';
import { Moon, Shield, Database, BookOpen, ChevronRight, LogOut, User, Info, Cpu } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { Brankas } from '@lembaran/core/Brankas';
import packageJson from '../../../package.json';

export default function SettingsPage() {
    const setVaultLocked = usePundi(s => s.setVaultLocked);

    const handleLock = () => {
        haptic.heavy();
        Brankas.clearKey();
        setVaultLocked(true);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] pb-32">
            <header className="snappy-header">
                <h1 className="text-xl font-extrabold tracking-tight">Laras</h1>
            </header>

            <div className="max-w-2xl mx-auto w-full px-5 py-6">
                <div className="ios-list-group">
                    <Link href="/jatidiri" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <User size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[17px]">Jatidiri</span>
                                <span className="text-[11px] text-[var(--text-muted)]">XP, Level, dan Jatidiri</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[var(--text-muted)]" />
                    </Link>
                </div>

                <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5 ml-4">Pengaturan Utama</h2>
                <div className="ios-list-group">
                    <Link href="/laras/tampilan" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                <Moon size={18} />
                            </div>
                            <span className="font-semibold">Tampilan</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <span className="text-sm">Otomatis</span>
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/laras/keamanan" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                                <Shield size={18} />
                            </div>
                            <span className="font-semibold">Keamanan Brankas</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/laras/data" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                                <Database size={18} />
                            </div>
                            <span className="font-semibold">Data & Penyimpanan</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/laras/integrasi" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center">
                                <Cpu size={18} />
                            </div>
                            <span className="font-semibold">Integrasi (MCP)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <span className="text-sm">0 Aktif</span>
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/bantuan" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                <BookOpen size={18} />
                            </div>
                            <span className="font-semibold">Bantuan</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                    <div className="ios-separator"></div>
                    <Link href="/tentang" className="ios-list-item" onClick={() => haptic.light()}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-500 text-white flex items-center justify-center">
                                <Info size={18} />
                            </div>
                            <span className="font-semibold">Tentang Aplikasi</span>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                    </Link>
                </div>

                <div className="ios-list-group">
                    <button
                        onClick={handleLock}
                        className="w-full ios-list-item text-red-500 active:bg-red-500/5 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                                <LogOut size={18} />
                            </div>
                            <span className="font-bold">Gembok Brankas</span>
                        </div>
                    </button>
                </div>

                <div className="p-8 text-center opacity-40">
                    <div className="font-bold text-xs uppercase tracking-[0.2em] mb-1">Lembaran</div>
                    <div className="text-[10px] font-medium">Build 2026.02.18 • Version {packageJson.version} (Developer Edition)</div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Key, Ghost, AlertTriangle, Fingerprint, Command } from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';
import { usePundi } from '@lembaran/core/Pundi';
import { Arsip } from '@lembaran/core/Arsip';

export default function SecurityManagementPage() {
    const { settings, updateSettings } = usePundi();
    const [panicInput, setPanicInput] = useState('');
    const [isPanicSaved, setIsPanicSaved] = useState(false);

    const toggleSetting = (key: 'secretMode' | 'biometricEnabled' | 'vimMode') => {
        haptic.light();
        if (key === 'secretMode') {
            const nextMode = settings.secretMode === 'none' ? 'gmail' : 'none';
            updateSettings({ secretMode: nextMode });
        } else {
            updateSettings({ [key]: !settings[key] });
        }
    };

    const handleSavePanic = async () => {
        if (!panicInput) return;
        await Arsip.setPanicKey(panicInput);
        setIsPanicSaved(true);
        setPanicInput('');
        haptic.success();
        setTimeout(() => setIsPanicSaved(false), 3000);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Pengaturan</span>
            </Link>

            <h1 className="text-3xl font-bold mb-8 tracking-tight">Keamanan & Akses</h1>

            <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Otentikasi</h2>
            <div className="ios-list-group mb-10">
                <div className="ios-list-item">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-green-500 text-white flex items-center justify-center shadow-sm">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-medium text-[17px]">Enkripsi Argon2id</span>
                    </div>
                    <span className="text-[var(--text-secondary)] text-sm">Aktif</span>
                </div>
                <div className="ios-separator"></div>
                <button
                    onClick={() => toggleSetting('biometricEnabled')}
                    className="w-full ios-list-item active:bg-[var(--surface-active)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Fingerprint size={18} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-[17px]">Biometrik (Touch/FaceID)</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Buka brankas tanpa password</span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.biometricEnabled ? 'bg-green-500' : 'bg-[var(--separator)]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>

            <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Produktivitas</h2>
            <div className="ios-list-group mb-10">
                <button
                    onClick={() => toggleSetting('vimMode')}
                    className="w-full ios-list-item active:bg-[var(--surface-active)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-600 text-white flex items-center justify-center shadow-sm">
                            <Command size={18} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-[17px]">Vim Mode</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Navigasi editor gaya Vim (H J K L)</span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.vimMode ? 'bg-green-500' : 'bg-[var(--separator)]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.vimMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>

            <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Protokol Darurat</h2>
            <div className="ios-list-group mb-10">
                <div className="p-4 bg-red-500/5 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-1.5 rounded-md bg-red-500 text-white flex items-center justify-center shadow-sm">
                            <AlertTriangle size={18} />
                        </div>
                        <span className="font-bold text-[17px]">Panic Key</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed">
                        Jika kata sandi ini dimasukkan di layar login, seluruh data brankas dan pengaturan akan <strong>dihapus secara permanen</strong> seketika.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            placeholder="Set Panic Key..."
                            value={panicInput}
                            onChange={(e) => setPanicInput(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500/50 transition-all"
                        />
                        <button
                            onClick={handleSavePanic}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isPanicSaved ? 'bg-green-500 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
                        >
                            {isPanicSaved ? 'Tersimpan' : 'Set'}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => toggleSetting('secretMode')}
                    className="w-full ios-list-item active:bg-[var(--surface-active)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-gray-600 text-white flex items-center justify-center shadow-sm">
                            <Ghost size={18} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-[17px]">Mode Rahasia</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Samarkan brankas sebagai Gmail</span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.secretMode === 'gmail' ? 'bg-green-500' : 'bg-[var(--separator)]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.secretMode === 'gmail' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-3">
                    <Key size={14} />
                    Informasi Brankas
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Arsip Anda dilindungi dengan enkripsi AES-256-GCM. Kata sandi diubah menjadi kunci kriptografi menggunakan algoritma Argon2id secara lokal di perangkat Anda.
                    <br /><br />
                    <strong>Multi-Vault:</strong> Versi terbaru mendukung manajemen beberapa brankas melalui menu inisialisasi di CLI.
                </p>
            </div>
        </div>
    );
}

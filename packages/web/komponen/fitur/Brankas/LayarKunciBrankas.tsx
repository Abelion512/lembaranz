'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, KeyRound, Unlock, ArrowRight,
    ChevronLeft, Check, Copy, Fingerprint
} from 'lucide-react';
import { Arsip } from '@lembaran/core/Arsip';
import { usePundi } from '@lembaran/core/Pundi';
import { haptic, audio } from '@lembaran/core/Indera';

const generateMnemonic = () => {
    const words = ["cakrawala", "aksara", "hening", "harmoni", "saujana", "bestari", "anitya", "baswara", "pustaka", "gudang", "brankas", "sentinel"];
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
};

export const LayarKunciBrankas = () => {
    const { setVaultLocked, settings, isVaultLocked } = usePundi();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [showPaperKey, setShowPaperKey] = useState(false);
    const [paperKey, setPaperKey] = useState('');
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        const checkVaultStatus = async () => {
            try {
                const initialized = await Arsip.isVaultInitialized();
                setIsSetupMode(!initialized);
                if (!initialized) setPaperKey(generateMnemonic());
            } catch (e) {
                console.error('Failed to check vault status', e);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkVaultStatus();
    }, []);

    useEffect(() => {
        if (!isVaultLocked && settings.sessionTimeout) {
            const timeout = setTimeout(() => {
                setVaultLocked(true);
                audio.lock();
                haptic.medium();
            }, settings.sessionTimeout * 60 * 1000);
            return () => clearTimeout(timeout);
        }
    }, [isVaultLocked, settings.sessionTimeout, setVaultLocked]);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return setError("Minimal 8 karakter");
        if (password !== confirmPassword) return setError("Kata sandi tidak cocok");
        setShowPaperKey(true);
    };

    const finalizeSetup = async () => {
        setIsLoading(true);
        try {
            await Arsip.setupVault(password);
            audio.unlock();
            setVaultLocked(false);
        } catch (_err) {
            setError("Gagal menyiapkan brankas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlock = async (e: React.FormEvent, directPassword?: string) => {
        if (e) e.preventDefault();
        const pw = directPassword === "biometric-simulated" ? "SIMULATED_KEY" : (directPassword || password);
        if (!pw) return;

        setIsLoading(true);
        setError(false);

        try {
            const isValid = pw === "SIMULATED_KEY" ? true : await Arsip.unlockVault(pw);
            if (isValid) {
                audio.unlock();
                setVaultLocked(false);
            } else {
                audio.lock();
                setError("Kata sandi salah");
            }
        } catch (_err) {
            setError("Gagal membuka brankas");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paperKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (checkingStatus) return <div className="fixed inset-0 z-[100] bg-[var(--background)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col p-6 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
                {!showPaperKey ? (
                    <motion.div key="auth-form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--surface)] shadow-sm flex items-center justify-center text-[var(--primary)] mb-8">
                            {isLoading ? <Unlock size={36} className="animate-pulse" /> : (isSetupMode ? <KeyRound size={36} /> : <Lock size={36} />)}
                        </div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">{isSetupMode ? 'Amankan Arsip' : 'Lembaran Vault'}</h1>
                        <p className="text-[var(--text-secondary)] text-[15px] mb-10 px-4">{isSetupMode ? 'Tetapkan kata sandi utama untuk enkripsi Argon2id sisi klien.' : 'Arsip Anda terenkripsi secara aman. Masukkan kata sandi untuk membukanya.'}</p>
                        <form onSubmit={isSetupMode ? handleSetup : handleUnlock} className="w-full space-y-4">
                            <div className="ios-list-group shadow-sm">
                                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} placeholder={isSetupMode ? "Kata Sandi Baru" : "Kata Sandi Brankas"} className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-center text-lg font-medium placeholder:opacity-30" autoFocus />
                                {isSetupMode && <><div className="ios-separator"></div><input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(false); }} placeholder="Ulangi Kata Sandi" className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-center text-lg font-medium placeholder:opacity-30" /></>}
                            </div>
                            {settings.biometricEnabled && !isSetupMode && (
                                <button type="button" onClick={() => handleUnlock({ preventDefault: () => { } } as unknown as React.FormEvent, "biometric-simulated")} className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-sm hover:bg-blue-500/20 transition-all">
                                    <Fingerprint size={18} /> Gunakan Biometrik
                                </button>
                            )}
                            <button type="submit" disabled={!password || (isSetupMode && !confirmPassword) || isLoading} className="ios-button ios-button-primary w-full shadow-lg shadow-[var(--primary)]/20 disabled:opacity-30">
                                {isLoading ? 'Memproses...' : (isSetupMode ? 'Lanjutkan' : 'Buka Brankas')}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                        {error && <p className="text-red-500 text-xs mt-6 font-semibold uppercase tracking-wider">{typeof error === "string" ? error : "Terjadi kesalahan"}</p>}
                    </motion.div>
                ) : (
                    <motion.div key="paper-key" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col max-w-md mx-auto w-full pt-10">
                        <header className="flex items-center gap-2 mb-8">
                            <button onClick={() => setShowPaperKey(false)} className="text-[var(--primary)]"><ChevronLeft size={24} /></button>
                            <h2 className="text-2xl font-bold tracking-tight">Kunci Kertas</h2>
                        </header>
                        <p className="text-[var(--text-secondary)] text-[15px] mb-8">Jika Anda lupa kata sandi, 12 kata ini adalah <strong>satu-satunya</strong> cara untuk memulihkan data Anda. Simpan di tempat yang aman dan pribadi.</p>
                        <div className="ios-list-group p-6 relative mb-10 border border-[var(--separator)]/30">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                                {paperKey.split(' ').map((word, i) => <div key={i} className="flex items-center gap-3"><span className="text-[10px] font-bold text-[var(--primary)] opacity-30 w-4">{i + 1}</span><span className="text-[15px] font-mono font-bold tracking-tight">{word}</span></div>)}
                            </div>
                            <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 rounded-full bg-[var(--background)] active:opacity-40">{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[var(--text-secondary)]" />}</button>
                        </div>
                        <div className="mt-auto pb-10">
                            <button onClick={finalizeSetup} className="ios-button ios-button-primary w-full shadow-lg">Saya Sudah Menyimpannya</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

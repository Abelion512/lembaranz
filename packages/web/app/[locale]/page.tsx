'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Download,
    Sparkles
} from 'lucide-react';
import { PasangTerminal } from '@/komponen/landing/PasangTerminal';
import { TabelPerbandingan } from '@/komponen/landing/TabelPerbandingan';
import { EtalaseLokal } from '@/komponen/landing/EtalaseLokal';
import { PratinjauLaras } from '@/komponen/landing/PratinjauLaras';
import { SaklarSuasana } from '@/komponen/landing/SaklarSuasana';

const WORDS = ['Berdikari', 'Aman', 'Cerdas', 'Pribadi', 'Instan'];

export default function LandingPage() {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-500 overflow-x-hidden">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-[var(--background)]/80 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20">
                        <Image src="/image.png" alt="Lembaran Logo" width={40} height={40} className="object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Lembaran</span>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Link href="/versi" className="hover:text-blue-500 transition-colors">Changelog</Link>
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                        <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Docs</Link>
                    </nav>
                    <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
                    <SaklarSuasana />
                    <Link href="/pustaka" className="px-5 py-2.5 bg-blue-500 text-white rounded-full font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Buka Brankas
                    </Link>
                </div>
            </header>

            <main className="pt-40 pb-24">
                {/* Hero Section */}
                <section className="px-6 text-center relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/30 blur-[120px] rounded-full" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-12 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles size={14} />
                            <span>Kecerdasan Personal Lokal-First</span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 mb-8">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                                <span className="text-gray-400">Aksara yang</span>
                                <div className="inline-flex items-center gap-3">
                                    <div className="relative h-[1.2em] flex items-center overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={WORDS[wordIndex]}
                                                initial={{ y: 40, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -40, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                className="text-blue-500 whitespace-nowrap"
                                            >
                                                {WORDS[wordIndex]}.
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </h1>
                        </div>

                        <p className="text-sm md:text-lg text-gray-500 max-w-xl mx-auto mb-16 leading-relaxed font-medium px-4">
                            Brankas aksara personal yang mengutamakan
                            privasi absolut, performa instan, dan kecerdasan buatan on-device.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 mb-24">
                            <Link href="/pustaka" className="px-8 py-3.5 bg-[var(--text-primary)] text-[var(--background)] rounded-xl font-bold flex items-center gap-3 hover:scale-105 hover:shadow-2xl transition-all">
                                Mulai Menulis <ArrowRight size={18} />
                            </Link>
                            <a href="#native" className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all">
                                <Download size={18} /> Unduh App
                            </a>
                        </div>
                    </motion.div>

                    {/* CLI Mockup */}
                    <div className="relative z-10">
                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10" />
                        <PasangTerminal />
                    </div>
                </section>

                {/* Comparison Table */}
                <TabelPerbandingan />

                {/* Customization Preview */}
                <PratinjauLaras />

                {/* Native Showcase */}
                <section id="native">
                    <EtalaseLokal />
                </section>
            </main>

            {/* Footer */}
            <footer className="p-12 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded overflow-hidden">
                            <Image src="/image.png" alt="Lembaran Logo" width={24} height={24} className="grayscale opacity-50" />
                        </div>
                        <span>© 2025 Lembaran Open Source.</span>
                    </div>
                    <div className="flex items-center gap-8 uppercase tracking-widest text-[10px] font-black opacity-50">
                        <Link href="/privasi" className="hover:text-blue-500 transition-colors">Privasi</Link>
                        <Link href="/ketentuan" className="hover:text-blue-500 transition-colors">Ketentuan</Link>
                        <Link href="/bantuan" className="hover:text-blue-500 transition-colors">Bantuan</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

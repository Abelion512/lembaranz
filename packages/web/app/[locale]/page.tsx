'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
import { PendaratanKaki } from '@/komponen/landing/PendaratanKaki';

export default function LandingPage() {
    const t = useTranslations();
    const WORDS = t.raw('Landing.KataKunci') as string[];
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [WORDS.length]);

    return (
        <div className="flex flex-col min-h-screen bg-(--background) text-(--text-primary) transition-colors duration-500 overflow-x-hidden">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-xl bg-(--background)/60 border-b border-(--separator)/5 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 group hover:scale-105 transition-transform cursor-pointer">
                        <Image src="/image.png" alt="Lembaran Logo" width={40} height={40} className="object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Lembaran</span>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-(--text-muted) mr-4">
                        <Link href="/version" className="hover:text-blue-500 transition-colors">{t('Selasar.Changelog')}</Link>
                        <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                        <Link href="/docs" className="hover:text-blue-500 transition-colors">{t('Selasar.Dokumentasi')}</Link>
                    </nav>
                    <div className="w-px h-6 bg-(--separator)/10 mx-2 hidden md:block"></div>

                    <a href="https://www.npmjs.com/org/abelion512" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#cb3837] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95" title="Buka NPM Registry">
                        NPM Registry
                    </a>
                </div>
            </header>

            <main className="pt-40 pb-24">
                {/* Hero Section */}
                <section className="px-6 text-center relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-blue-500/30 blur-[120px] rounded-full" />
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15, delayChildren: 0.2 }
                            }
                        }}
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}>
                        <div className="mb-12 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles size={12} />
                            <span>{t('Landing.badge')}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 mb-8">
                            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter flex flex-wrap items-center justify-center gap-x-4 gap-y-2 uppercase">
                                <span className="text-gray-400">Aksara yang</span>
                                <div className="inline-flex items-center">
                                    <div className="relative flex items-center overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={WORDS[wordIndex]}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                                className="text-blue-500 whitespace-nowrap inline-block"
                                            >
                                                {WORDS[wordIndex]}.
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </h1>
                        </div>

                        <p className="text-sm md:text-lg text-gray-400/80 max-w-xl mx-auto mb-16 leading-relaxed font-medium px-4">
                            {t('Landing.tagline')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6 mb-24">
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative px-8 py-4 bg-black/80 border border-white/10 rounded-2xl font-mono text-sm text-green-400 flex items-center gap-4 shadow-2xl backdrop-blur-xl">
                                    <span className="text-gray-600 select-none">❯</span>
                                    <span>npm install -g @lembaranz/cli</span>
                                </div>
                            </div>
                            <Link href="/docs/MULAI_CEPAT" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-lg shadow-white/5">
                                {t('Selasar.Dokumentasi')} <ArrowRight size={16} className="text-blue-500" />
                            </Link>
                        </div>
                        </motion.div>
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

            <PendaratanKaki />
        </div>
    );
}

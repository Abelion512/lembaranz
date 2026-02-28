'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { LucideIcon, Shield, Terminal, BookOpen, Rocket, Zap, Layers, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';
import { ambilTerjemahan } from '@/lib/ambilTerjemahan';
import { ambilMetadataBantuan, ButirMetadata } from '@/lib/ambilKontenDok';

const IKON_MAP: Record<string, LucideIcon> = {
    Shield,
    Terminal,
    BookOpen,
    Rocket,
    Zap,
    Layers,
    Globe
};

const DEFAULT_UI = {
    title: "Pusat Bantuan",
    desc: "Selamat datang di dokumentasi resmi Lembaran. Temukan panduan untuk menguasai kedaulatan data Anda.",
    footerTitle: "Butuh bantuan lebih lanjut?",
    footerDesc: "Buka diskusi di repositori GitHub kami untuk bertanya langsung kepada pengembang.",
    footerBtn: "Buka Diskusi GitHub"
};

interface KartuBantuan extends Omit<ButirMetadata, 'icon'> {
    id: string;
    icon: LucideIcon;
}

export default function AnjunganBantuan() {
    const lang = useLocale() as 'id' | 'en';
    const [ui, setUi] = useState(DEFAULT_UI);
    const [cards, setCards] = useState<KartuBantuan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const muatKonten = async () => {
            setLoading(true);
            try {
                // 1. Ambil Metadata Bantuan (Source of Truth)
                const metadata = await ambilMetadataBantuan(lang);
                if (metadata) {
                    const mappedCards = Object.entries(metadata).map(([id, data]: [string, ButirMetadata]): KartuBantuan => ({
                        id,
                        ...data,
                        icon: IKON_MAP[data.icon] || BookOpen
                    }));
                    // Tampilkan hanya 4 kartu utama di anjungan jika mau, atau semua.
                    // Di prompt awal ada 4, tapi indeks.json punya lebih. Kita tampilkan yang ada di indeks saja.
                    setCards(mappedCards);
                }

                // 2. Terjemahkan UI statis jika bukan Indonesia
                if (lang === 'en') {
                    const [title, desc, footerTitle, footerDesc, footerBtn] = await Promise.all([
                        ambilTerjemahan(DEFAULT_UI.title, 'en'),
                        ambilTerjemahan(DEFAULT_UI.desc, 'en'),
                        ambilTerjemahan(DEFAULT_UI.footerTitle, 'en'),
                        ambilTerjemahan(DEFAULT_UI.footerDesc, 'en'),
                        ambilTerjemahan(DEFAULT_UI.footerBtn, 'en'),
                    ]);
                    setUi({ title, desc, footerTitle, footerDesc, footerBtn });
                } else {
                    setUi(DEFAULT_UI);
                }
            } catch (error) {
                console.error('[Bantuan] Load error:', error);
            }
            setLoading(false);
        };

        muatKonten();
    }, [lang]);

    return (
        <LembaranDok
            title={ui.title}
            description={ui.desc}
        >
            <div className="flex justify-between items-center mb-8">
                {loading && (
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Memuat Dokumentasi...
                    </div>
                )}
                <div className="flex-1" />
                <SaklarBahasa />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {cards.map(card => (
                    <Link
                        key={card.id}
                        href={`/bantuan/${card.id}`}
                        className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--separator)]/10 hover:border-blue-500/30 transition-all group shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} />
                        </div>
                        <h3 className="text-xl font-black mb-3">{card.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{card.desc}</p>
                    </Link>
                ))}
            </div>

            <section className="p-10 rounded-[3rem] bg-blue-500 text-white shadow-2xl shadow-blue-500/20">
                <h2 className="text-2xl font-black mb-4">{ui.footerTitle}</h2>
                <p className="text-blue-100 mb-8 font-medium">{ui.footerDesc}</p>
                <a
                    href="https://github.com/Abelion512/lembaran/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-500 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                    {ui.footerBtn}
                </a>
            </section>
        </LembaranDok>
    );
}

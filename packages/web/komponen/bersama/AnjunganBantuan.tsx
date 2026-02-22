'use client';

import React, { useEffect, useState } from 'react';
import { usePundi } from '@lembaran/core/Pundi';
import { Shield, Terminal, BookOpen, Rocket } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';
import { ambilTerjemahan } from '@/lib/ambilTerjemahan';

const BASE_CARDS = [
    {
        id: 'MULAI_CEPAT',
        title: 'Mulai Cepat',
        desc: 'Panduan langkah demi langkah untuk instalasi dan setup awal.',
        icon: Rocket,
        color: 'bg-orange-500/10 text-orange-500'
    },
    {
        id: 'keamanan',
        title: 'Keamanan Absolut',
        desc: 'Pelajari bagaimana kami mengamankan data Anda dengan AES-GCM 256.',
        icon: Shield,
        color: 'bg-green-500/10 text-green-500'
    },
    {
        id: 'cli',
        title: 'Antarmuka CLI',
        desc: 'Panduan lengkap penggunaan terminal untuk efisiensi maksimal.',
        icon: Terminal,
        color: 'bg-blue-500/10 text-blue-500'
    },
    {
        id: 'perintah',
        title: 'Daftar Perintah',
        desc: 'Referensi cepat untuk semua perintah CLI Lembaran.',
        icon: BookOpen,
        color: 'bg-purple-500/10 text-purple-500'
    }
];

const DEFAULT_UI = {
    title: "Pusat Bantuan",
    desc: "Selamat datang di dokumentasi resmi Lembaran. Temukan panduan untuk menguasai kedaulatan data Anda.",
    footerTitle: "Butuh bantuan lebih lanjut?",
    footerDesc: "Buka diskusi di repositori GitHub kami untuk bertanya langsung kepada pengembang.",
    footerBtn: "Buka Diskusi GitHub"
};

export default function AnjunganBantuan() {
    const lang = usePundi(state => state.settings.language) || 'id';
    const [ui, setUi] = useState(DEFAULT_UI);
    const [cards, setCards] = useState(BASE_CARDS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const translateUI = async () => {
            if (lang === 'id') {
                setUi(DEFAULT_UI);
                setCards(BASE_CARDS);
                return;
            }

            setLoading(true);
            try {
                // Translate static strings
                const [title, desc, footerTitle, footerDesc, footerBtn] = await Promise.all([
                    ambilTerjemahan(DEFAULT_UI.title, 'en'),
                    ambilTerjemahan(DEFAULT_UI.desc, 'en'),
                    ambilTerjemahan(DEFAULT_UI.footerTitle, 'en'),
                    ambilTerjemahan(DEFAULT_UI.footerDesc, 'en'),
                    ambilTerjemahan(DEFAULT_UI.footerBtn, 'en'),
                ]);

                setUi({ title, desc, footerTitle, footerDesc, footerBtn });

                // Translate card content
                const translatedCards = await Promise.all(BASE_CARDS.map(async (card) => {
                    const [cTitle, cDesc] = await Promise.all([
                        ambilTerjemahan(card.title, 'en'),
                        ambilTerjemahan(card.desc, 'en')
                    ]);
                    // Map target slug if it's the getting started one
                    const targetId = card.id === 'MULAI_CEPAT' ? 'GETTING_STARTED' : card.id;
                    return { ...card, id: targetId, title: cTitle, desc: cDesc };
                }));

                setCards(translatedCards);
            } catch (error) {
                console.error('[BantuanClient] Translation error:', error);
            }
            setLoading(false);
        };

        translateUI();
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
                        AI Translating...
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-500 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                    {ui.footerBtn}
                </a>
            </section>
        </LembaranDok>
    );
}

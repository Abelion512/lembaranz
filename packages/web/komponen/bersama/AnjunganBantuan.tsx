'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LucideIcon, Shield, Terminal, BookOpen, Rocket, Zap, Layers, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';
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


interface KartuBantuan extends Omit<ButirMetadata, 'icon'> {
    id: string;
    icon: LucideIcon;
    color?: string;
    title?: string;
    desc?: string;
}

export default function AnjunganBantuan() {
    const lang = useLocale() as 'id' | 'en';
    const t = useTranslations('Bantuan');
    const [cards, setCards] = useState<KartuBantuan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const muatKonten = async () => {
            setLoading(true);
            try {
                setError(null);
                const metadata = await ambilMetadataBantuan(lang);
                if (metadata) {
                    const mappedCards = Object.entries(metadata).map(([id, data]: [string, ButirMetadata]): KartuBantuan => ({
                        id,
                        ...data,
                        icon: IKON_MAP[data.icon] || BookOpen
                    }));
                    setCards(mappedCards);
                } else {
                    setError("Gagal memuat metadata dokumentasi.");
                }
            } catch (error) {
                console.error('[Bantuan] Load error:', error);
                setError(error instanceof Error ? error.message : String(error));
            }
            setLoading(false);
        };

        muatKonten();
    }, [lang]);

    return (
        <LembaranDok
            title={t('pusat_bantuan') || "Pusat Bantuan"}
            description={t('pusat_bantuan_desc') || "Selamat datang di dokumentasi resmi Lembaran. Temukan panduan untuk menguasai kedaulatan data Anda."}
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

            {error && (
                <div className="p-10 rounded-[3rem] bg-red-500/5 border border-red-500/10 text-red-500 mb-12">
                    <h2 className="text-xl font-black mb-2">Terjadi Kesalahan</h2>
                    <p className="text-sm opacity-70">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                {cards.map(card => (
                    <Link
                        key={card.id}
                        href={`/bantuan/${card.id}`}
                        className="p-10 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                            <card.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-4">{card.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed opacity-80">{card.desc}</p>
                    </Link>
                ))}
            </div>

            <section className="p-12 rounded-[2.5rem] bg-blue-500 text-white shadow-2xl shadow-blue-500/20 flex flex-col items-center text-center">
                <h2 className="text-2xl font-black mb-4">{t('footer_tanya_judul') || "Butuh bantuan lebih lanjut?"}</h2>
                <p className="text-blue-100 mb-8 font-medium">{t('footer_tanya_desc') || "Buka diskusi di repositori GitHub kami untuk bertanya langsung kepada pengembang."}</p>
                <a
                    href="https://github.com/Abelion512/lembaran/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-500 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                    {t('footer_tanya_tombol') || "Buka Diskusi GitHub"}
                </a>
            </section>
        </LembaranDok>
    );
}

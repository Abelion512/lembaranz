import React from 'react';
import { DocPage } from '@/komponen/bersama/DocPage';
import { Shield, Zap, Terminal, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BantuanPage() {
    return (
        <DocPage
            title="Pusat Bantuan"
            description="Selamat datang di dokumentasi resmi Lembaran. Temukan panduan untuk menguasai kedaulatan data Anda."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        id: 'keamanan',
                        title: 'Keamanan Absolut',
                        desc: 'Pelajari bagaimana kami mengamankan data Anda dengan AES-GCM 256.',
                        icon: Shield,
                        color: 'bg-green-500/10 text-green-500'
                    },
                    {
                        id: 'performa',
                        title: 'Optimasi Performa',
                        desc: 'Cara Lembaran menangani ribuan catatan dengan instan.',
                        icon: Zap,
                        color: 'bg-yellow-500/10 text-yellow-500'
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
                ].map(card => (
                    <Link
                        key={card.id}
                        href={`/bantuan/${card.id === 'index' ? '' : card.id}`}
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
                <h2 className="text-2xl font-black mb-4">Butuh bantuan lebih lanjut?</h2>
                <p className="text-blue-100 mb-8 font-medium">Buka diskusi di repositori GitHub kami untuk bertanya langsung kepada pengembang.</p>
                <a
                    href="https://github.com/Abelion512/lembaran/discussions"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-500 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                    Buka Diskusi GitHub
                </a>
            </section>
        </DocPage>
    );
}

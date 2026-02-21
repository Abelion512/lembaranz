'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePundi } from '@lembaran/core/Pundi';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { PenerjemahAksara } from '@/komponen/bersama/PenerjemahAksara';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';
import { ambilTerjemahan } from '@/lib/ambilTerjemahan';

const DOCS_DATA_ID = {
    'MULAI_CEPAT': {
        title: "Mulai Cepat",
        desc: "Panduan langkah demi langkah untuk menguasai Lembaran dalam hitungan menit."
    },
    'cli': {
        title: "Antarmuka CLI",
        desc: "Lembaran menyediakan antarmuka terminal yang kuat untuk alur kerja yang efisien."
    },
    'keamanan': {
        title: "Keamanan Absolut",
        desc: "Pelajari bagaimana kami mengamankan data Anda dengan standar industri tertinggi."
    },
    'perintah': {
        title: "Daftar Perintah",
        desc: "Referensi cepat untuk semua perintah CLI Lembaran."
    },
    'performa': {
        title: "Optimasi Performa",
        desc: "Bagaimana Lembaran tetap cepat meski memproses ribuan catatan."
    },
    'struktur': {
        title: "Arsitektur Sistem",
        desc: "Memahami struktur internal dan desain monorepo Lembaran."
    },
    'publik': {
        title: "Mulai Berdikari",
        desc: "Panduan memahami ekosistem Lembaran dan menguasai kedaulatan data Anda."
    }
};

export default function DynamicDocPage() {
    const params = useParams();
    const slug = params.slug as string;
    const lang = usePundi(state => state.settings.language) || 'id';

    const [meta, setMeta] = useState({ title: slug, desc: "..." });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const updateMeta = async () => {
            const base = DOCS_DATA_ID[slug as keyof typeof DOCS_DATA_ID] || { title: slug, desc: "Documentation page." };

            if (lang === 'id') {
                setMeta(base);
                return;
            }

            setLoading(true);
            try {
                const [title, desc] = await Promise.all([
                    ambilTerjemahan(base.title, 'en'),
                    ambilTerjemahan(base.desc, 'en')
                ]);
                setMeta({ title, desc });
            } catch (error) {
                console.error('[DynamicDocPage] Meta translation error:', error);
                setMeta(base);
            }
            setLoading(false);
        };

        updateMeta();
    }, [slug, lang]);

    return (
        <LembaranDok
            title={meta.title}
            description={meta.desc}
        >
            <div className="flex justify-between items-center mb-8">
                {loading && (
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">
                        AI Translating Meta...
                    </div>
                )}
                <div className="flex-1" />
                <SaklarBahasa />
            </div>

            <PenerjemahAksara slug={slug} />
        </LembaranDok>
    );
}

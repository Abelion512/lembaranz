'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePundi } from '@lembaran/core/Pundi';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { PenerjemahAksara } from '@/komponen/bersama/PenerjemahAksara';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';

const DOCS_DATA = {
    id: {
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
    },
    en: {
        'GETTING_STARTED': {
            title: "Getting Started",
            desc: "Step-by-step guide to mastering Lembaran in minutes."
        },
        'cli': {
            title: "CLI Interface",
            desc: "Lembaran provides a powerful terminal interface for an efficient workflow."
        },
        'keamanan': {
            title: "Absolute Security",
            desc: "Learn how we secure your data with the highest industry standards."
        },
        'perintah': {
            title: "Command List",
            desc: "Quick reference for all Lembaran CLI commands."
        },
        'performa': {
            title: "Performance Optimization",
            desc: "How Lembaran stays fast while processing thousands of notes."
        },
        'struktur': {
            title: "System Architecture",
            desc: "Understanding the internal structure and design of the Lembaran monorepo."
        },
        'publik': {
            title: "Sovereignty First",
            desc: "A guide to understanding the Lembaran ecosystem and mastering data sovereignty."
        }
    }
};

export default function DynamicDocPage() {
    const params = useParams();
    const slug = params.slug as string;
    const lang = usePundi(state => state.settings.language) || 'id';

    // Normalize slug for Getting Started based on current language if needed
    // But we let the URL decide the slug, and DocRenderer handle fallback.
    const langData = DOCS_DATA[lang as keyof typeof DOCS_DATA] as Record<string, { title: string; desc: string }>;
    const t = langData?.[slug] || { title: slug, desc: "Documentation page." };

    return (
        <LembaranDok
            title={t.title}
            description={t.desc}
        >
            <div className="flex justify-end mb-8">
                <SaklarBahasa />
            </div>

            <PenerjemahAksara slug={slug} />
        </LembaranDok>
    );
}

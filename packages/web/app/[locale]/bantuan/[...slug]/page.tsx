'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { LembaranDok } from '@/komponen/bersama/LembaranDok';
import { PenerjemahAksara } from '@/komponen/bersama/PenerjemahAksara';
import { SaklarBahasa } from '@/komponen/bersama/SaklarBahasa';
import { ambilMetadataBantuan } from '@/lib/ambilKontenDok';

export default function DynamicDocPage() {
    const params = useParams();
    const slugArray = params.slug as string | string[];
    const slug = Array.isArray(slugArray) ? slugArray.join('/') : slugArray;
    const lang = useLocale() as 'id' | 'en';
    const [metadata, setMetadata] = useState<{ title: string; desc: string } | null>(null);

    useEffect(() => {
        async function loadMetadata() {
            const data = await ambilMetadataBantuan(lang);
            if (data && data[slug]) {
                setMetadata(data[slug]);
            } else {
                setMetadata({ title: slug, desc: "Documentation page." });
            }
        }
        loadMetadata();
    }, [slug, lang]);

    return (
        <LembaranDok
            title={metadata?.title || slug}
            description={metadata?.desc || "..."}
            slug={slug}
        >
            <div className="flex justify-end mb-8">
                <SaklarBahasa />
            </div>

            <PenerjemahAksara slug={slug} />
        </LembaranDok>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { DocLayout } from '@/components/shared/DocLayout';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { getHelpMetadata, type MetadataItemDetail } from '@/lib/getDocContent';

export default function DynamicDocPage() {
    const params = useParams();
    const slugArray = params.slug as string | string[];
    const slug = Array.isArray(slugArray) ? slugArray.join('/') : slugArray;
    const lang = useLocale() as 'id' | 'en';
    const [metadata, setMetadata] = useState<MetadataItemDetail | null>(null);

    useEffect(() => {
        async function loadMetadata() {
            const data = await getHelpMetadata(lang);
            // Find item matching slug in chapters
            if (data && data.chapters) {
                for (const chapter of data.chapters) {
                    const item = chapter.items.find((i) => i.id === slug);
                    if (item) {
                        setMetadata(item);
                        return;
                    }
                }
            }
            setMetadata({ id: slug, slug, title: slug, description: "Documentation page." });
        }
        loadMetadata();
    }, [slug, lang]);

    return (
        <DocLayout
            title={metadata?.title || slug}
            description={metadata?.description || "..."}
            slug={slug}
        >
            <div className="flex justify-end mb-8">
                <LanguageSwitcher />
            </div>

            <MarkdownRenderer slug={slug} />
        </DocLayout>
    );
}

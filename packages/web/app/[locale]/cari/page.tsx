'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Arsip, Brankas, Note, haptic } from '@lembaran/core';
import { Link } from '@/i18n/navigation';
import { Search as SearchIcon, ChevronRight, Sparkles, X } from 'lucide-react';
import { stripHtml } from '@lembaran/core/Penyaring';
import { KerangkaCatatan } from '@/komponen/bersama/KerangkaCatatan';
import { useGunakanTunda } from '@lembaran/core/GunakanTunda';
import { IlustrasiKosong } from "@/komponen/bersama/IlustrasiKosong";

// Global cache to persist between navigations (fast search)
const decryptionCache = new Map<string, string>();

const Highlight = React.memo(({ text, query }: { text: string, query: string }) => {
    if (!query.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-sm px-0.5">{part}</mark>
                    : part
            )}
        </>
    );
});

Highlight.displayName = 'Highlight';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [decryptedCount, setDecryptedCount] = useState(0);

    const debouncedQuery = useGunakanTunda(query, 200); // Faster debounce for Bolt performance

    useEffect(() => {
        const loadAll = async () => {
            try {
                const data = await Arsip.getAllNotes();
                setNotes(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, []);

    // Background decryption task for "Smart Find"
    useEffect(() => {
        if (notes.length === 0) return;

        let active = true;
        const decryptBatch = async (index: number) => {
            if (!active || index >= notes.length) return;

            const batch = notes.slice(index, index + 25);
            await Promise.all(batch.map(async (note) => {
                if (!decryptionCache.has(note.id)) {
                    try {
                        const decrypted = await Brankas.decryptPacked(note.content);
                        decryptionCache.set(note.id, stripHtml(decrypted));
                    } catch {
                        decryptionCache.set(note.id, '');
                    }
                }
            }));

            if (active) {
                setDecryptedCount(decryptionCache.size);
                // Continue in next tick to avoid blocking UI
                setTimeout(() => decryptBatch(index + 25), 50);
            }
        };

        decryptBatch(0);
        return () => { active = false; };
    }, [notes]);

    const filteredNotes = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        const q = debouncedQuery.toLowerCase();

        return notes.map(note => {
            const titleMatch = (note.title || '').toLowerCase().includes(q);
            const previewMatch = (note.preview || '').toLowerCase().includes(q);

            // Smart Find: check cached content
            const content = decryptionCache.get(note.id) || '';
            const contentMatch = content.toLowerCase().includes(q);

            if (titleMatch || previewMatch || contentMatch) {
                return {
                    ...note,
                    isSmartMatch: contentMatch && !titleMatch && !previewMatch
                };
            }
            return null;
        }).filter(Boolean) as (Note & { isSmartMatch: boolean })[];
        // Indikasi hasil pencarian cerdas
    }, [debouncedQuery, notes]);

    return (
        <div className="flex-1 flex flex-col min-h-0 px-5 pt-14 pb-32 overflow-hidden bg-(--background)">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Cari</h1>
                {decryptedCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
                        <Sparkles size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Smart Find Active</span>
                    </div>
                )}
            </div>

            <div className="relative mb-8">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary)">
                    <SearchIcon size={20} />
                </div>
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari judul atau isi..."
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-(--surface) border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none shadow-sm text-[17px] placeholder:opacity-40 transition-all"
                    aria-label="Kotak pencarian"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); haptic.light(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-(--separator)/10 text-(--text-secondary) active:scale-90 transition-all"
                        aria-label="Bersihkan pencarian"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {isLoading ? (
                    <KerangkaCatatan />
                ) : !query.trim() ? (
                    <div className="text-center mt-20 opacity-30 px-10">
                        <p className="text-sm font-semibold uppercase tracking-widest mb-2">Jelajah Arsip</p>
                        <p className="text-xs font-medium">Cari catatan di dalam brankas terenkripsi.</p>
                        {decryptedCount < notes.length && notes.length > 0 && (
                            <p className="text-[10px] mt-4 font-bold uppercase tracking-tighter opacity-50">
                                Mengindeks Brankas... {Math.round((decryptedCount / notes.length) * 100)}%
                            </p>
                        )}
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="mt-10">
                        <IlustrasiKosong pesan="Hasil Tidak Ditemukan" />
                    </div>
                ) : (
                    <div className="ios-list-group shadow-sm">
                        {filteredNotes.map((note, index) => (
                            <React.Fragment key={note.id}>
                                <Link href={`/catatan/${note.id}`} className="ios-list-item group relative">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-base font-semibold truncate">
                                                <Highlight text={note.title || 'Tanpa Judul'} query={debouncedQuery} />
                                            </h3>
                                            {note.isSmartMatch && (
                                                <span className="shrink-0 text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                    Isi
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-blue-500 opacity-40">
                                                {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <p className="text-[11px] text-(--text-secondary) truncate opacity-70">
                                                <Highlight text={note.preview || 'Tanpa pratinjau'} query={debouncedQuery} />
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-(--separator)" />
                                </Link>
                                {index < filteredNotes.length - 1 && <div className="ios-separator"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

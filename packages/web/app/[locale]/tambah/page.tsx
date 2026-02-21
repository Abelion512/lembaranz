'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Arsip } from '@lembaran/core/Arsip';
import { haptic } from '@lembaran/core/Indera';
import { getIconForService } from '@/komponen/IkonLayanan';
import dynamic from 'next/dynamic';
import { ChevronLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PenyusunKredensial } from '@/komponen/fitur/Kredensial/PenyusunKredensial';
import { SaranLayanan } from '@/komponen/fitur/Kredensial/SaranLayanan';
import { AnimatePresence } from 'framer-motion';

const PenyusunCatatan = dynamic(
    () => import('@/komponen/fitur/Penyusun/PenyusunCatatan').then(mod => mod.PenyusunCatatan),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

function AddNoteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCredentials, setIsCredentials] = useState(false);
    const [kredensial, setKredensial] = useState({ username: '', password: '', url: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setTitle('');
        setContent('');
        setIsCredentials(false);
        setKredensial({ username: '', password: '', url: '' });

        if (mode === 'credentials') {
            setIsCredentials(true);
        } else if (mode === 'checklist') {
            setTitle('Log & Tugas - ' + new Date().toLocaleDateString('id-ID'));
            setContent('<ul data-type="taskList"><li data-checked="false"><p>Tugas Utama</p></li><li data-checked="false"><p></p></li></ul>');
        }
    }, [mode]);

    const handleSave = async () => {
        if (!content.trim() && !title.trim() && !kredensial.username) return;

        setIsSaving(true);
        try {
            await Arsip.saveNote({
                id: crypto.randomUUID(),
                title: title || 'Tanpa Judul',
                content: content,
                folderId: null,
                isPinned: false,
                isFavorite: false,
                tags: [],
                createdAt: new Date().toISOString(),
                isCredentials: isCredentials,
                kredensial: isCredentials ? kredensial : undefined
            });
            haptic.success();
            router.push('/');
        } catch (error) {
            console.error('Failed to save note:', error);
            haptic.error();
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectSuggestion = (name: string, domain: string) => {
        // Respect brand-specific casing
        let formattedName = name;
        if (name.toLowerCase() === 'n8n') formattedName = 'n8n';
        else if (name.toLowerCase() === 'v0') formattedName = 'v0';
        else if (name.toLowerCase() === 's3') formattedName = 'S3';
        else formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        setTitle(formattedName);
        setKredensial(prev => ({ ...prev, url: domain }));
        setShowSuggestions(false);
        haptic.light();
    };

    const currentIcon = isCredentials ? getIconForService(title, 28) : null;

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-hidden bg-[var(--background)]">
            <header className="snappy-header w-full flex items-center justify-between px-3 sm:px-4">
                <button onClick={() => { haptic.light(); router.back(); }} className="text-[var(--primary)] flex items-center gap-1 active:opacity-40 transition-opacity p-1">
                    <ChevronLeft size={24} />
                    <span className="text-[15px] sm:text-[17px] font-semibold">Batal</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => { haptic.medium(); setIsCredentials(!isCredentials); }} title='Identitas Credentials'
                        className={`p-1.5 rounded-full transition-all ${isCredentials ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}
                    >
                        {isCredentials ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </button>
                    <button onClick={handleSave} disabled={isSaving || (!title && !content && !kredensial.username)} className="text-[var(--primary)] text-[15px] sm:text-[17px] font-bold active:opacity-40 px-2 py-1">
                        Simpan
                    </button>
                </div>
            </header>

            <div className="flex-1 px-3 sm:px-4 py-2 overflow-y-auto no-scrollbar w-full">
                <div className="relative mb-3 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        {isCredentials && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--separator)]/10 overflow-hidden flex-shrink-0">
                                {currentIcon || <ShieldCheck size={22} className="text-[var(--primary)]" />}
                            </div>
                        )}
                        <input
                            type="text"
                            value={title}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
                            placeholder={isCredentials ? "Nama Layanan / Akun..." : "Judul Catatan..."}
                            className="flex-1 text-lg sm:text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20 min-w-0"
                            autoFocus
                        />
                    </div>
                    <AnimatePresence>
                        {isCredentials && showSuggestions && (
                            <SaranLayanan input={title} onSelect={handleSelectSuggestion} />
                        )}
                    </AnimatePresence>
                </div>

                <div className="max-w-6xl mx-auto w-full">
                    {isCredentials && (
                        <PenyusunKredensial data={kredensial} onChange={(data) => setKredensial(data as { username: string; password: string; url: string })} />
                    )}
                    <PenyusunCatatan
                        content={content}
                        onChange={setContent}
                        placeholder={isCredentials ? "Catatan tambahan..." : "Mulai menulis..."}
                    />
                </div>
                <div className="h-32" />
            </div>
        </div>
    );
}

export default function AddNotePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center opacity-30">Menyiapkan...</div>}>
            <AddNoteContent />
        </Suspense>
    );
}

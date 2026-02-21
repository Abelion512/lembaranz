'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Arsip } from '@lembaran/core/Arsip';
import { haptic } from '@lembaran/core/Indera';
import { useGunakanTunda } from '@lembaran/core/GunakanTunda';
import { Note } from '@lembaran/core/Rumus';
import { getIconForService } from '@/komponen/IkonLayanan';
import dynamic from 'next/dynamic';
import {
    ChevronLeft, Trash2, MoreHorizontal,
    CloudCheck, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { PenyusunKredensial } from '@/komponen/fitur/Kredensial/PenyusunKredensial';
import { SaranLayanan } from '@/komponen/fitur/Kredensial/SaranLayanan';
import { AnimatePresence } from 'framer-motion';

const PenyusunCatatan = dynamic(
    () => import('@/komponen/fitur/Penyusun/PenyusunCatatan').then(mod => mod.PenyusunCatatan),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">Memuat Editor...</div> }
);

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCredentials, setIsCredentials] = useState(false);
    const [kredensial, setKredensial] = useState({ username: '', password: '', url: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedTitle = useGunakanTunda(title, 1000);
    const debouncedContent = useGunakanTunda(content, 1000);
    const debouncedIsCreds = useGunakanTunda(isCredentials, 1000);
    const debouncedKred = useGunakanTunda(kredensial, 1000);

    const lastSavedHash = useRef("");

    useEffect(() => {
        const loadNote = async () => {
            try {
                const data = await Arsip.getNoteById(id);
                if (data) {
                    setNote(data);
                    setTitle(data.title);
                    setContent(data.content);
                    setIsCredentials(!!data.isCredentials);
                    if (data.kredensial) setKredensial(data.kredensial as { username: string; password: string; url: string });

                    lastSavedHash.current = JSON.stringify({
                        title: data.title,
                        content: data.content,
                        isCredentials: !!data.isCredentials,
                        kredensial: data.kredensial
                    });
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoaded(true);
            }
        };
        loadNote();
    }, [id, router]);

    useEffect(() => {
        if (isLoaded && note) {
            const autosave = async () => {
                const currentDataStr = JSON.stringify({
                    title: debouncedTitle,
                    content: debouncedContent,
                    isCredentials: debouncedIsCreds,
                    kredensial: debouncedKred
                });

                if (lastSavedHash.current === currentDataStr) return;

                const isUnchangedFromOriginal = debouncedTitle === note.title &&
                    debouncedContent === note.content &&
                    debouncedIsCreds === note.isCredentials &&
                    JSON.stringify(debouncedKred) === JSON.stringify(note.kredensial);

                if (isUnchangedFromOriginal) return;

                setSaveStatus('saving');
                try {
                    const updatedNote = await Arsip.saveNote({
                        ...note,
                        title: debouncedTitle || 'Tanpa Judul',
                        content: debouncedContent,
                        isCredentials: debouncedIsCreds,
                        kredensial: debouncedKred
                    });

                    lastSavedHash.current = currentDataStr;
                    setNote({
                        ...updatedNote,
                        content: debouncedContent,
                        kredensial: debouncedKred
                    });

                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                } catch (error) {
                    console.error('Autosave failed:', error);
                    setSaveStatus('idle');
                }
            };
            autosave();
        }
    }, [debouncedTitle, debouncedContent, debouncedIsCreds, debouncedKred, isLoaded, note]);

    const handleSaveManual = async () => {
        if (!note) return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const updatedNote = await Arsip.saveNote({
                ...note,
                title: title || 'Tanpa Judul',
                content: content,
                isCredentials: isCredentials,
                kredensial: kredensial
            });

            lastSavedHash.current = JSON.stringify({ title, content, isCredentials, kredensial });

            setNote({
                ...updatedNote,
                content: content,
                kredensial: kredensial
            });

            haptic.success();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save note:', error);
            haptic.error();
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectSuggestion = (name: string, domain: string) => {
        setTitle(name.charAt(0).toUpperCase() + name.slice(1));
        setKredensial(prev => ({ ...prev, url: domain }));
        setShowSuggestions(false);
        haptic.light();
    };

    const handleDelete = async () => {
        if (!confirm('Hapus catatan ini secara permanen?')) return;
        haptic.heavy();
        try {
            await Arsip.deleteNote(id);
            router.push('/');
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    if (!isLoaded) {
        return <div className="p-20 text-center opacity-30">Menyiapkan Enkripsi...</div>;
    }

    const currentIcon = isCredentials ? getIconForService(title, 28) : null;

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-hidden bg-[var(--background)]">
            <header className="snappy-header w-full flex items-center justify-between gap-2 px-3 sm:px-4">
                <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                    <button onClick={() => { haptic.light(); router.back(); }} className="text-[var(--primary)] active:opacity-40 p-1">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-[var(--text-secondary)] opacity-50 truncate hidden sm:inline">
                        {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : 'Editor'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {saveStatus === 'saved' && <CloudCheck size={18} className="text-green-500" />}
                    <button
                        onClick={() => { haptic.medium(); setIsCredentials(!isCredentials); }}
                        className={`p-1.5 rounded-full transition-all ${isCredentials ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-muted)] opacity-50'}`}
                    >
                        {isCredentials ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </button>
                    <button onClick={() => { haptic.light(); setShowOptions(!showOptions); }} className="p-1.5 text-[var(--text-primary)]">
                        <MoreHorizontal size={22} />
                    </button>
                    <button onClick={handleSaveManual} disabled={isSaving} className="text-[var(--primary)] text-[15px] sm:text-[17px] font-bold active:opacity-40 px-2 py-1">
                        Selesai
                    </button>
                </div>
            </header>

            {showOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowOptions(false)} />
                    <div className="w-full max-w-sm glass-card p-2 z-10 shadow-2xl">
                        <button className="ios-list-item w-full text-left" onClick={() => { setShowOptions(false); handleDelete(); }}>
                            <div className="flex items-center gap-3 text-red-500">
                                <Trash2 size={18} />
                                <span className="font-semibold">Hapus Permanen</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 px-3 sm:px-4 py-2 overflow-y-auto no-scrollbar w-full">
                <div className="relative mb-3 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        {isCredentials && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--separator)]/10 flex-shrink-0">
                                {currentIcon || <ShieldCheck size={22} className="text-[var(--primary)]" />}
                            </div>
                        )}
                        <input
                            type="text"
                            value={title}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
                            placeholder={isCredentials ? "Layanan / Akun..." : "Judul..."}
                            className="flex-1 text-lg sm:text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--text-secondary)]/20 min-w-0"
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
                        onChange={(val) => {
                            setContent(val);
                            if (saveStatus !== 'saving') setSaveStatus('idle');
                        }}
                        placeholder={isCredentials ? "Catatan tambahan..." : "Mulai menulis..."}
                    />
                </div>
                <div className="h-32" />
            </div>
        </div>
    );
}

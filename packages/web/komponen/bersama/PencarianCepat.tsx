'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ChevronRight, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Arsip } from '@lembaran/core/Arsip';
import { haptic } from '@lembaran/core/Indera';
import { Note } from '@lembaran/core/Rumus';
import { getIconForService } from '@/komponen/IkonLayanan';

export const PencarianCepat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const router = useRouter();

    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                toggleOpen();
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleOpen]);

    useEffect(() => {
        if (isOpen) {
            Arsip.getAllNotes().then(setNotes).catch(console.error);
        }
    }, [isOpen]);

    const filteredNotes = notes
        .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);

    const navigate = (id: string) => {
        router.push(`/catatan/${id}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[210] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="w-full max-w-lg bg-[#1c1c1e] text-white rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden relative z-10"
                    >
                        <div className="flex items-center px-5 py-4 border-b border-white/5">
                            <Search size={20} className="text-gray-500 mr-3" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buka catatan (Fuzzy search title...)"
                                className="flex-1 bg-transparent border-none focus:outline-none text-lg py-1 placeholder:text-gray-600 pr-8"
                                aria-label="Kotak pencarian cepat"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(""); haptic.light(); }}
                                    className="p-1 rounded-full hover:bg-white/10 text-gray-500 active:scale-90 transition-all"
                                    aria-label="Bersihkan pencarian"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="p-2 overflow-y-auto max-h-[50vh] no-scrollbar">
                            {filteredNotes.length > 0 ? (
                                filteredNotes.map((note) => {
                                    const serviceIcon = note.isCredentials ? getIconForService(note.title, 18) : null;
                                    return (
                                        <button
                                            key={note.id}
                                            onClick={() => navigate(note.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                    {serviceIcon || <FileText size={18} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[15px]">{note.title || 'Tanpa Judul'}</span>
                                                    <span className="text-[11px] text-gray-500">Terakhir diubah: {new Date(note.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center opacity-20">
                                    <p className="text-sm font-medium">Catatan tidak ditemukan</p>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span>Cmd+P Quick Open</span>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><span className="px-1 rounded bg-white/10 border border-white/10">⏎</span> Buka</span>
                                <span className="flex items-center gap-1"><span className="px-1 rounded bg-white/10 border border-white/10">ESC</span> Tutup</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

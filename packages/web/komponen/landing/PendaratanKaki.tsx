'use client';

import React from 'react';
import { Github, Shield, Book, FileText, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const PendaratanKaki = () => {
    return (
        <footer className="p-12 border-t border-[var(--separator)]/5 bg-[var(--surface)]/5 mt-20">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[var(--text-muted)] text-sm font-medium">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText size={14} className="text-blue-500" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">Lembaran</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">
                        © 2026 Lembaran Open Source
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 uppercase tracking-[0.2em] text-[10px] font-black text-[var(--text-muted)]/60">
                    <Link href="/id/privasi" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <Shield size={12} /> Privacy
                    </Link>
                    <Link href="/id/ketentuan" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <FileText size={12} /> Terms
                    </Link>
                    <Link href="/id/bantuan" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <Book size={12} /> Docs
                    </Link>
                    <Link href="/id/tentang" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle size={12} /> Support
                    </Link>
                    <a href="https://github.com/Abelion512/lembaran" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <Github size={12} /> GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
};

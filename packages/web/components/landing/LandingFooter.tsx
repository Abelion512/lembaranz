'use client';

import React from 'react';
import { Github, Shield, Book, FileText, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const LandingFooter = () => {
    return (
        <footer className="p-12 border-t border-(--separator)/5 bg-(--surface)/5 mt-20">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-(--text-muted) text-sm font-medium">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText size={14} className="text-blue-500" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-(--text-primary)">Lembaran</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">
                        © 2026 Lembaran Open Source
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 uppercase tracking-[0.2em] text-[10px] font-black text-(--text-muted)/60">
                    <Link href="/privacy" className="flex items-center gap-2 hover:text-blue-500 transition-colors text-(--text-muted) hover:text-(--text-primary)">
                        <Shield size={12} /> Privacy
                    </Link>
                    <Link href="/terms" className="flex items-center gap-2 hover:text-blue-500 transition-colors text-(--text-muted) hover:text-(--text-primary)">
                        <FileText size={12} /> Terms
                    </Link>
                    <Link href="/docs" className="flex items-center gap-2 hover:text-blue-500 transition-colors text-(--text-muted) hover:text-(--text-primary)">
                        <Book size={12} /> Docs
                    </Link>
                    <Link href="/about" className="flex items-center gap-2 hover:text-blue-500 transition-colors text-(--text-muted) hover:text-(--text-primary)">
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

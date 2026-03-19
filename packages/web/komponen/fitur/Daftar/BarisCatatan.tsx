'use client';

import React, { memo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import {
    CheckCircle2, FileText, Pin, Copy, Check
} from 'lucide-react';
import { Note } from '@lembaran/core/Rumus';
import { haptic } from '@lembaran/core/Indera';
import { getIconForService } from '@/komponen/IkonLayanan';
import { formatWaktuRelatif } from '@lembaran/core/Waktu';
import { motion, AnimatePresence } from 'framer-motion';

interface BarisCatatanProps {
    note: Note;
    isSelected: boolean;
    isEditMode: boolean;
    onToggle: (id: string) => void;
    onCopy: (e: React.MouseEvent, note: Note) => void;
    isCopied: boolean;
}

/**
 * BarisCatatan: Optimized list item component.
 * Now uses pre-generated 'preview' field from Note object to avoid on-the-fly decryption.
 */
export const BarisCatatan = memo(({
    note, isSelected, isEditMode, onToggle, onCopy, isCopied
}: BarisCatatanProps) => {
    const [justCopied, setJustCopied] = useState(false);
    const serviceIcon = getIconForService(note.title, 24);
    const preview = note.preview || 'Tanpa isi';

    const handleDoubleClick = () => {
        if (!isEditMode) {
            navigator.clipboard.writeText(note.title || "Tanpa Judul");
            haptic.success();
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        }
    };

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div
                onClick={() => isEditMode ? onToggle(note.id) : null}
                onDoubleClick={handleDoubleClick}
                className={`flex items-center gap-3 px-4 py-3 transition-all active:bg-blue-500/5 cursor-pointer relative group ${isSelected ? 'bg-blue-500/10' : ''}`}
            >
                {isEditMode ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <CheckCircle2
                            size={22}
                            className={isSelected ? 'text-blue-500' : 'text-blue-500/20'}
                            fill={isSelected ? 'currentColor' : 'none'}
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/5 flex items-center justify-center flex-shrink-0 text-blue-500 overflow-hidden border border-blue-500/10 shadow-sm transition-transform">
                        {serviceIcon || <FileText size={20} className="opacity-40" />}
                    </div>
                )}

                <Link
                    href={isEditMode ? '#' : `/catatan/${note.id}`}
                    className="flex-1 min-w-0"
                    onClick={(e) => isEditMode && e.preventDefault()}
                >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0 relative">
                            <h3 className="text-[15px] font-bold truncate tracking-tight text-[var(--text-primary)]">
                                {note.title || 'Tanpa Judul'}
                            </h3>
                            <AnimatePresence>
                                {justCopied && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.8 }}
                                        animate={{ opacity: 1, y: -20, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute left-0 top-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10 pointer-events-none whitespace-nowrap uppercase tracking-widest"
                                    >
                                        Tersalin!
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {note.isPinned && <Pin size={12} className="text-blue-500 fill-blue-500 rotate-45 flex-shrink-0" />}
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] whitespace-nowrap opacity-60 uppercase tracking-tighter">
                            {formatWaktuRelatif(note.updatedAt)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] text-[var(--text-secondary)] truncate leading-snug opacity-70">
                            {preview}
                        </p>
                        {!isEditMode && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => onCopy(e, note)}
                                    className="p-1 rounded-md active:bg-blue-500/10 text-blue-500 transition-transform"
                                >
                                    {isCopied ? <Check size={14} /> : <Copy size={14} className="opacity-40" />}
                                </button>
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
});

BarisCatatan.displayName = 'BarisCatatan';

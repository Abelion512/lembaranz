'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Ghost } from 'lucide-react';

export const EmptyState = ({ message = "Belum ada data" }: { message?: string }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mb-6"
            >
                <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 backdrop-blur-sm">
                    <FileText size={40} className="text-blue-500 opacity-20" strokeWidth={1} />
                </div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 bg-[var(--surface)] p-2 rounded-xl shadow-lg border border-[var(--separator)]/10"
                >
                    <Ghost size={20} className="text-indigo-400" />
                </motion.div>
            </motion.div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 opacity-80">{message}</h3>
            <p className="text-xs font-medium text-[var(--text-secondary)] opacity-40 uppercase tracking-[0.2em]">Lembaran</p>
        </div>
    );
};

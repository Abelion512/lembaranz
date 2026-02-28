'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Laptop, Bell, Check } from 'lucide-react';

export const EtalaseLokal = () => {
    const [notified, setNotified] = useState<string | null>(null);

    const handleNotify = (label: string) => {
        setNotified(label);
        // In a real app, this would send to an API
        setTimeout(() => setNotified(null), 3000);
    };

    const devices = [
        { icon: Smartphone, label: 'iOS & Android', color: 'bg-blue-500/20 text-blue-500' },
        { icon: Laptop, label: 'macOS & Windows', color: 'bg-purple-500/20 text-purple-500' },
        { icon: Monitor, label: 'Linux (Flatpak)', color: 'bg-emerald-500/20 text-emerald-500' }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-24 px-4 pb-24">
            <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Ekosistem Native</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {devices.map((device, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="group relative aspect-[4/5] rounded-[2.5rem] bg-gray-900 border border-white/5 overflow-hidden flex flex-col items-center justify-center gap-6"
                    >
                        <div className={`w-20 h-20 rounded-3xl ${device.color} flex items-center justify-center shadow-2xl`}>
                            <device.icon size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">{device.label}</h3>
                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Coming Soon</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleNotify(device.label)}
                            className="absolute bottom-10 px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95"
                        >
                            <AnimatePresence mode="wait">
                                {notified === device.label ? (
                                    <motion.div
                                        key="check"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="flex items-center gap-2 text-green-400"
                                    >
                                        <Check size={14} /> Tersimpan
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="bell"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Bell size={14} /> Beri Tahu Saya
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        {/* Overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-10 opacity-10 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    Lihat roadmap pengembangan kami di <a href="https://github.com/Abelion512/lembaran/discussions" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub Discussions</a>.
                </p>
            </div>
        </div>
    );
};

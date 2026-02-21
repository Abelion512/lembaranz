'use client';

import React, { useEffect, useState } from 'react';
import { Arsip } from '@lembaran/core/Arsip';
import { usePundi } from '@lembaran/core/Pundi';
import { motion, AnimatePresence } from 'framer-motion';
import { PerayaanXP } from "@/komponen/bersama/PerayaanXP";

export default function ProfilePage() {
    const profile = usePundi(s => s.profile);
    const [stats, setStats] = useState({ notes: 0, folders: 0 });
    const [activity, setActivity] = useState<{ day: string, count: number, height: number }[]>([]);
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            const s = await Arsip.getStats();
            setStats(s);

            // Generate mock activity based on note count for visual flavor
            const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            const mockActivity = days.map((day, _i) => {
                const count = Math.floor(Math.random() * (s.notes + 2));
                return {
                    day,
                    count,
                    height: Math.min((count / (s.notes || 5)) * 100, 100)
                };
            });
            setActivity(mockActivity);
        };
        load();
    }, []);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-32 overflow-y-auto no-scrollbar">
            <PerayaanXP active={profile.xp > 0} />
            <div className="flex flex-col items-center text-center mb-10">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl border-4 border-white dark:border-gray-800"
                >
                    {profile.name[0]}
                </motion.div>
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <p className="text-[var(--text-secondary)] text-[15px] font-medium opacity-80 italic">&ldquo;{profile.bio}&rdquo;</p>

                <div className="flex gap-3 mt-8 w-full">
                    <div className="flex-1 bg-[var(--background)] rounded-2xl p-4 border border-[var(--separator)]/20 shadow-sm">
                        <div className="text-3xl font-bold text-[var(--primary)] mb-1">{stats.notes}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)]">Catatan</div>
                    </div>
                    <div className="flex-1 bg-[var(--background)] rounded-2xl p-4 border border-[var(--separator)]/20 shadow-sm">
                        <div className="text-3xl font-bold text-indigo-500 mb-1">{stats.folders}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-secondary)]">Folder</div>
                    </div>
                </div>
            </div>

            <div className="ios-list-group p-6 pb-8 mb-6 !overflow-visible">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-semibold text-[15px]">Aktivitas Menulis</h3>
                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase bg-[var(--primary)]/10 px-2 py-1 rounded-md">7 Hari Terakhir</span>
                </div>

                <div className="h-40 flex items-end justify-between gap-3 px-1 relative">
                    {activity.map((item, i) => (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center group cursor-pointer relative"
                            onMouseEnter={() => setHoveredDay(i)}
                            onMouseLeave={() => setHoveredDay(null)}
                            onTouchStart={() => setHoveredDay(i)}
                        >
                            <AnimatePresence>
                                {hoveredDay === i && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute -top-12 bg-[var(--text-primary)] text-[var(--background)] text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap shadow-lg"
                                    >
                                        {item.count} Catatan
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-primary)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="w-full bg-[var(--primary)]/10 rounded-full h-full relative overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(item.height, 6)}%` }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 100, delay: i * 0.05 }}
                                    className={`absolute bottom-0 w-full ${hoveredDay === i ? 'bg-indigo-500' : 'bg-[var(--primary)]'} transition-colors duration-300`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter opacity-60 px-1">
                    {activity.map((item, i) => <span key={i} className={hoveredDay === i ? 'text-[var(--primary)]' : ''}>{item.day}</span>)}
                </div>
            </div>

            <div className="ios-list-group">
                <div className="ios-list-item">
                    <span className="font-medium text-[15px]">Pencapaian (XP)</span>
                    <span className="text-[var(--primary)] font-bold">{profile.xp} XP</span>
                </div>
                <div className="ios-separator"></div>
                <div className="ios-list-item">
                    <span className="font-medium text-[15px]">Level</span>
                    <span className="text-[var(--text-secondary)]">Penjaga Aksara (Lvl {profile.level})</span>
                </div>
            </div>
        </div>
    );
}

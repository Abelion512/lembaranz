'use client';

import React, { useState } from 'react';
import { Palette, Settings, Shield, Zap } from 'lucide-react';

export const CustomizationPreview = () => {
    const [activeColor, setActiveColor] = useState('blue');

    const colors = [
        { id: 'blue', hex: '#3b82f6', label: 'Classic Blue' },
        { id: 'emerald', hex: '#10b981', label: 'Deep Emerald' },
        { id: 'amber', hex: '#f59e0b', label: 'Cyber Amber' },
        { id: 'rose', hex: '#f43f5e', label: 'Soft Rose' },
        { id: 'purple', hex: '#a855f7', label: 'Vibrant Purple' }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-24 px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Kustomisasi Tanpa Batas</h2>
                <p className="text-gray-500 font-medium">Lembaran didesain untuk menyesuaikan dengan selera estetika Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Preview Area */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 blur-[40px] rounded-full -z-10 opacity-50" />

                    <div className="glass-card p-1 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden bg-black/20">
                        <div className="bg-[#0a0a0a] rounded-[2.3rem] p-8 overflow-hidden relative">
                            {/* Inner Preview */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Preview Mode</div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500`} style={{ backgroundColor: colors.find(c => c.id === activeColor)?.hex }}>
                                        <Shield size={24} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                                        <div className="h-2 w-full bg-white/5 rounded-full" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                                        <div className="w-8 h-4 rounded-full p-1 bg-green-500">
                                            <div className="w-2 h-2 bg-white rounded-full translate-x-4" />
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full" />
                                    <div className="h-1.5 w-3/4 bg-white/5 rounded-full" />
                                </div>

                                <button className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all duration-500" style={{ backgroundColor: colors.find(c => c.id === activeColor)?.hex }}>
                                    Simpan Perubahan
                                </button>
                            </div>

                            {/* Glow Effect */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] -z-10 opacity-30 transition-all duration-500" style={{ backgroundColor: colors.find(c => c.id === activeColor)?.hex }} />
                        </div>
                    </div>
                </div>

                {/* Control Area */}
                <div className="space-y-8">
                    <div>
                        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                            <Palette size={20} className="text-blue-500" />
                            Aksen Warna Utama
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setActiveColor(color.id)}
                                    className={`w-12 h-12 rounded-2xl border-2 transition-all active:scale-90 ${activeColor === color.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">Animasi Halus</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Setiap transisi menggunakan spring physics untuk pengalaman yang organik dan responsif.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">Kontrol Detil</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Sesuaikan blur, opasitas glassmorphism, dan radius sudut sesuai keinginan Anda.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

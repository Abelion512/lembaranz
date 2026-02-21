'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Cpu, Shield, Globe, Trash2, Power } from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

export default function IntegrasiPage() {
    const [integrations, _setIntegrations] = useState([
        { id: '1', name: 'Claude MCP Server', type: 'Local', status: 'Inactive', icon: Cpu },
        { id: '2', name: 'Lembaran GitHub Sync', type: 'Cloud', status: 'Inactive', icon: Globe },
    ]);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] pb-32">
            <header className="snappy-header">
                <div className="flex items-center gap-4">
                    <Link href="/laras" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-extrabold tracking-tight">Integrasi (MCP)</h1>
                </div>
                <button
                    className="p-2 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    onClick={() => haptic.medium()}
                >
                    <Plus size={20} />
                </button>
            </header>

            <div className="max-w-2xl mx-auto w-full px-5 py-8">
                <div className="mb-8 px-4">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        Hubungkan Lembaran dengan layanan eksternal atau server MCP lokal untuk memperluas kapabilitas Brankas Anda.
                    </p>
                </div>

                <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-4">Layanan Terhubung</h2>

                <div className="space-y-4">
                    {integrations.length === 0 ? (
                        <div className="p-12 text-center bg-[var(--surface)] rounded-[2.5rem] border border-dashed border-[var(--separator)]/20">
                            <Cpu size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                            <p className="text-sm text-[var(--text-muted)] font-medium">Belum ada integrasi aktif.</p>
                        </div>
                    ) : (
                        integrations.map((item) => (
                            <div key={item.id} className="p-6 rounded-[2rem] bg-[var(--surface)] border border-[var(--separator)]/10 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-500/10 flex items-center justify-center text-[var(--text-primary)]">
                                        <item.icon size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base">{item.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded">
                                                {item.type}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'text-green-500' : 'text-orange-500'}`}>
                                                • {item.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] transition-colors">
                                        <Power size={18} />
                                    </button>
                                    <button className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10">
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-blue-500" /> Keamanan Integrasi
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Setiap integrasi MCP berjalan di lingkungan terisolasi. Lembaran akan meminta izin Anda sebelum memberikan akses ke data tertentu.
                    </p>
                </div>
            </div>
        </div>
    );
}

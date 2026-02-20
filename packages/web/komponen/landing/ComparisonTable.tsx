'use client';

import React from 'react';
import { Terminal, Globe, Smartphone } from 'lucide-react';

const COMPARISON_DATA = [
    {
        feature: 'Aksesibilitas',
        cli: 'Terminal / SSH',
        web: 'Browser (Anywhere)',
        app: 'Desktop (Native)'
    },
    {
        feature: 'Biometrik',
        cli: '❌ Password Only',
        web: 'Planned (WebAuthn)',
        app: 'Yes (TouchID/FaceID)'
    },
    {
        feature: 'Kelebihan',
        cli: 'Ringan & Cepat',
        web: 'Tanpa Instalasi',
        app: 'Offline-First + Push'
    },
    {
        feature: 'Kekurangan',
        cli: 'Kurang Visual',
        web: 'Butuh Internet/Cache',
        app: 'Butuh Resource Lebih'
    },
    {
        feature: 'Saran Peran',
        cli: 'Senior / Master',
        web: 'Pemula / Junior',
        app: 'Explorer / Power User'
    }
];

export const ComparisonTable = () => {
    return (
        <div className="w-full max-w-5xl mx-auto mt-24 px-4">
            <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Pilih Konfigurasi Anda</h2>
            <div className="overflow-x-auto rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-6 text-sm font-bold uppercase tracking-widest text-gray-500">Fitur</th>
                            <th className="p-6">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <Terminal size={18} />
                                    <span className="font-bold">CLI</span>
                                </div>
                            </th>
                            <th className="p-6">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Globe size={18} />
                                    <span className="font-bold">WEB</span>
                                </div>
                            </th>
                            <th className="p-6">
                                <div className="flex items-center gap-2 text-purple-500">
                                    <Smartphone size={18} />
                                    <span className="font-bold">APP</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {COMPARISON_DATA.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 font-bold text-gray-400 text-sm">{row.feature}</td>
                                <td className="p-6 text-gray-200">
                                    {row.cli}
                                </td>
                                <td className="p-6 text-gray-200">
                                    {row.web}
                                </td>
                                <td className="p-6 text-gray-200">
                                    {row.app}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-2">Saran Maestro</p>
                    <p className="text-sm text-gray-400">Gunakan CLI untuk automasi script dan manajemen server jarak jauh.</p>
                </div>
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Biometrik Web</p>
                    <p className="text-sm text-gray-400">Dukungan sidik jari di browser (WebAuthn) sedang dalam tahap pengembangan.</p>
                </div>
                <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                    <p className="text-xs font-bold text-purple-500 uppercase mb-2">Keunggulan Native</p>
                    <p className="text-sm text-gray-400">Instal Native App untuk dukungan penuh sidik jari dan pengenalan wajah sistem.</p>
                </div>
            </div>
        </div>
    );
};

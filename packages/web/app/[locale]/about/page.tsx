'use client';

import { Link } from '@/i18n/navigation';
import { ChevronLeft, FileText, ScrollText, Shield, Github, Heart } from 'lucide-react';
import packageJson from '../../../package.json';
import { haptic } from '@lembaranz/core/Senses';

export default function TentangPage() {
    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-10 overflow-y-auto no-scrollbar'>
            <Link
                href='/laras'
                onClick={() => haptic.light()}
                className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'
            >
                <ChevronLeft size={24} />
                <span className='text-[17px]'>Kembali</span>
            </Link>

            <div className='flex flex-col items-center mb-10'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center mb-4'>
                    <Heart size={40} className='text-white fill-white' />
                </div>
                <h1 className='text-2xl font-bold tracking-tight'>Lembaran</h1>
                <p className='text-[var(--text-secondary)] text-sm'>Versi {packageJson.version}</p>
            </div>

            <div className='ios-list-group mb-8'>
                <Link href='/versi' className='ios-list-item flex items-center justify-between p-4 active:bg-black/5 dark:active:bg-white/5 transition-colors'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-orange-500 text-white flex items-center justify-center'>
                            <FileText size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Riwayat Perubahan (Changelog)</span>
                    </div>
                    <ChevronLeft size={16} className='text-[var(--text-muted)] rotate-180' />
                </Link>
                <div className='ios-separator'></div>
                <Link href='/ketentuan' className='ios-list-item flex items-center justify-between p-4 active:bg-black/5 dark:active:bg-white/5 transition-colors'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-gray-500 text-white flex items-center justify-center'>
                            <ScrollText size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Syarat & Ketentuan</span>
                    </div>
                    <ChevronLeft size={16} className='text-[var(--text-muted)] rotate-180' />
                </Link>
                <div className='ios-separator'></div>
                <Link href='/privasi' className='ios-list-item flex items-center justify-between p-4 active:bg-black/5 dark:active:bg-white/5 transition-colors'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-blue-500 text-white flex items-center justify-center'>
                            <Shield size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Kebijakan Privasi</span>
                    </div>
                    <ChevronLeft size={16} className='text-[var(--text-muted)] rotate-180' />
                </Link>
            </div>

            <div className='ios-list-group'>
                <Link href='https://github.com/Abelion512/lembaran' target='_blank' className='ios-list-item flex items-center justify-between p-4 active:bg-black/5 dark:active:bg-white/5 transition-colors'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-md bg-zinc-800 text-white flex items-center justify-center'>
                            <Github size={16} />
                        </div>
                        <span className='font-medium text-[16px]'>Source Code</span>
                    </div>
                    <div className='flex items-center gap-1 text-[var(--text-muted)] text-sm'>
                        <span>GitHub</span>
                        <ChevronLeft size={16} className='rotate-180' />
                    </div>
                </Link>
            </div>

            <div className='mt-10 text-center text-xs text-[var(--text-muted)] leading-relaxed px-10 opacity-70'>
                Dibuat dengan ❤️ dan dedikasi untuk Kedaulatan Data.
                <br />
                © 2026 Lembaran National Archives.
            </div>
        </div>
    );
}

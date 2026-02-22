'use client';

import React from 'react';
import { usePathname } from '@/i18n/navigation';
import { PintuBrankas } from '@/komponen/fitur/Brankas/PintuBrankas';
import { KemudiBawah } from '@/komponen/bersama/KemudiBawah';
import { PaletPerintah } from '@/komponen/bersama/PaletPerintah';
import { PencarianCepat } from '@/komponen/bersama/PencarianCepat';

export const PenyaringRute = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    // Rute yang dapat diakses tanpa membuka brankas
    const rutePublik = [
        '/',
        '/bantuan',
        '/versi',

        '/ketentuan',
        '/privasi',
        '/tentang'
    ];

    const isPublik = rutePublik.includes(pathname) || pathname.startsWith('/bantuan/');

    if (isPublik) {
        return <div className="flex-1 flex flex-col w-full min-h-screen bg-[var(--background)]">{children}</div>;
    }

    return (
        <PintuBrankas>
            <div className="flex-1 flex flex-col relative min-h-screen bg-[var(--background)]">
                <PaletPerintah />
                <PencarianCepat />
                <div className="flex-1 w-full min-w-0">
                    {children}
                </div>
                <KemudiBawah />
            </div>
        </PintuBrankas>
    );
};

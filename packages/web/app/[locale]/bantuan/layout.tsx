import React from 'react';
import { SelasarBantuan } from '@/komponen/bersama/SelasarBantuan';

export default function DocLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full min-h-screen bg-[var(--background)]">
            <SelasarBantuan />
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}

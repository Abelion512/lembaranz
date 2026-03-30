import { Command } from 'commander';
import { KonteksLaras } from '@lembaranz/core';
import React from 'react';
import { render } from 'ink';
import { siapkanKonteks, masukLayarTUI, keluarLayarTUI } from '../utils.js';

export const jalankanTUI = async (konteks: KonteksLaras, versi: string, layarAwal?: string, filterAwal?: string) => {
    masukLayarTUI();

    // Dynamic import
    const { Aplikasi } = await import('../tui/Aplikasi.js');

    const { waitUntilExit } = render(
        React.createElement(Aplikasi, { konteks, versi, layarAwal: layarAwal as any, filterAwal }),
        { exitOnCtrlC: false } // Handle in Aplikasi.tsx
    );

    try {
        await waitUntilExit();
    } finally {
        keluarLayarTUI();
    }
};

export function registrasiPerintahMulai(program: Command, versi: string) {
    program
        .command('mulai')
        .description('Menjalankan Antarmuka Terminal Interaktif (TUI)')
        .action(async () => {
            const konteks = await siapkanKonteks(program.opts());
            await jalankanTUI(konteks, versi);
        });
}

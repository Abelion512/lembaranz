import { Command } from 'commander';
import { KonteksLaras } from '@lembaran/core';
import React from 'react';
import { render } from 'ink';
import { siapkanKonteks, masukLayarTUI, keluarLayarTUI } from '../utils.js';

let exitAttempts = 0;
let exitTimer: NodeJS.Timeout | null = null;

/**
 * Handles Ctrl+C with double-verify for exit
 */
const handleCtrlC = () => {
    exitAttempts++;

    if (exitAttempts === 1) {
        // First attempt - show warning
        console.log('\n⚠️  Tekan Ctrl+C sekali lagi untuk keluar');
        console.log('   (atau tunggu 3 detik untuk membatalkan)\n');

        // Reset after 3 seconds
        exitTimer = setTimeout(() => {
            exitAttempts = 0;
            exitTimer = null;
            console.log('✅ Exit dibatalkan\n');
        }, 3000);
    } else {
        // Second attempt - actually exit
        console.log('\n👋 Sampai jumpa! Lembaran ditutup.\n');

        // Clear timer
        if (exitTimer) {
            clearTimeout(exitTimer);
            exitTimer = null;
        }

        // Reset counter
        exitAttempts = 0;

        // Cleanup and exit
        keluarLayarTUI();
        process.exit(0);
    }
};

export const jalankanTUI = async (konteks: KonteksLaras, versi: string) => {
    masukLayarTUI();

    // Reset exit attempts when starting
    exitAttempts = 0;
    if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = null;
    }

    // Dynamic import relative to this file's location in dist structure
    const { Aplikasi } = await import('../tui/Aplikasi.js');

    const { waitUntilExit } = render(
        React.createElement(Aplikasi, { konteks, versi }),
        { exitOnCtrlC: false } // Disable default Ctrl+C exit
    );

    // Custom Ctrl+C handler with double-verify
    process.on('SIGINT', handleCtrlC);
    process.on('SIGTERM', handleCtrlC);

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

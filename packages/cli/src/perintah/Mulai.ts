import { Command } from 'commander';
import { KonteksLaras } from '@lembaran/core';
import React from 'react';
import { render } from 'ink';
import { siapkanKonteks, masukLayarTUI, keluarLayarTUI } from '../utils.js';

export const jalankanTUI = async (konteks: KonteksLaras, versi: string) => {
  masukLayarTUI();

  // Dynamic import relative to this file's location in dist structure
  // src/perintah/Mulai.ts -> dist/perintah/Mulai.js
  // src/tui/Aplikasi.ts -> dist/tui/Aplikasi.js
  // Path should be ../tui/Aplikasi.js
  const { Aplikasi } = await import('../tui/Aplikasi.js');

  const { waitUntilExit } = render(
    React.createElement(Aplikasi, { konteks, versi }),
    { exitOnCtrlC: true }
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

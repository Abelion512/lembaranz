#!/usr/bin/env bun
import { program } from 'commander';
import { Laras, Gudang, Pujangga, KonteksLaras } from '@lembaran/core';
import React from 'react';
import { render } from 'ink';

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Terjadi kesalahan fatal (Rejection):', reason);
});
process.on('uncaughtException', (error) => {
  console.error('\n❌ Terjadi kesalahan fatal (Exception):', error);
});

const VERSI = '3.2.0';

program
  .name('lembaran')
  .description('Lembaran — CLI Pengelolaan Aksara Personal')
  .version(VERSI)
  .option('--saku', 'Gunakan konteks brankas personal (global)')
  .option('--pelataran', 'Gunakan konteks brankas proyek (lokal)')
  .option('--ai <provider>', 'Pilih model AI (gemini, none)', 'none');

// Middleware
const siapkanKonteks = async (opts: { saku?: boolean; pelataran?: boolean; ai?: string }): Promise<KonteksLaras> => {
  let konteks: KonteksLaras;

  if (opts.saku) konteks = 'saku';
  else if (opts.pelataran) konteks = 'pelataran';
  else konteks = await Laras.deteksiKonteksOtomatis();

  if (process.env.DEBUG === 'true') console.log(`[DEBUG] Konteks: ${konteks}`);

  if (opts.ai) {
    Pujangga.setProvider(opts.ai as any);
  }

  const jalur = await Laras.temukanJalur(konteks);
  await Gudang.inisialisasi(jalur);
  return konteks;
};

// Alternate screen helpers
const masukLayarTUI = () => {
  process.stdout.write('\x1b[?1049h'); // Enter alternate screen
  process.stdout.write('\x1b[2J\x1b[H'); // Clear alternate screen & move cursor to top-left
};

const keluarLayarTUI = () => {
  process.stdout.write('\x1b[?1049l'); // Leave alternate screen
};

// === TUI MODE ===
const jalankanTUI = async (konteks: KonteksLaras) => {
  masukLayarTUI();

  const { Aplikasi } = await import('./tui/Aplikasi.js');

  const { waitUntilExit } = render(
    React.createElement(Aplikasi, { konteks, versi: VERSI }),
    { exitOnCtrlC: true }
  );

  try {
    await waitUntilExit();
  } finally {
    keluarLayarTUI();
  }
};

// Default: TUI interaktif penuh
program.action(async () => {
  const konteks = await siapkanKonteks(program.opts());
  await jalankanTUI(konteks);
});

program
  .command('mulai')
  .description('Menjalankan Antarmuka Terminal Interaktif (TUI)')
  .action(async () => {
    const konteks = await siapkanKonteks(program.opts());
    await jalankanTUI(konteks);
  });

// === SUBCOMMANDS ===
program
  .command('pantau')
  .description('Memantau kesehatan dan integritas sistem')
  .action(async () => {
    const konteks = await siapkanKonteks(program.opts());
    masukLayarTUI();

    const { LayarPantau } = await import('./tui/LayarPantau.js');
    const { BarStatus } = await import('./tui/BarStatus.js');
    const { useApp, Box } = await import('ink');

    const LayarCepat = () => {
      const app = useApp();
      return React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Box, { flexDirection: 'column', marginBottom: 1 },
          React.createElement(LayarPantau, { konteks, onKembali: () => app.exit() })
        ),
        React.createElement(BarStatus, { konteks, versi: VERSI, layar: 'Pantau' })
      );
    };

    const { waitUntilExit } = render(
      React.createElement(LayarCepat),
      { exitOnCtrlC: true }
    );

    try {
      await waitUntilExit();
    } finally {
      keluarLayarTUI();
    }
  });

program
  .command('keamanan')
  .description('Menampilkan dashboard keamanan')
  .action(async () => {
    await siapkanKonteks(program.opts());
    masukLayarTUI();

    const { LayarKeamanan } = await import('./tui/LayarKeamanan.js');
    const { useApp, Box } = await import('ink');

    const LayarCepat = () => {
      const app = useApp();
      return React.createElement(Box, { flexDirection: 'column' },
        React.createElement(LayarKeamanan, { onKembali: () => app.exit() })
      );
    };

    const { waitUntilExit } = render(
      React.createElement(LayarCepat),
      { exitOnCtrlC: true }
    );

    try {
      await waitUntilExit();
    } finally {
      keluarLayarTUI();
    }
  });

program
  .command('pengaturan')
  .alias('config')
  .description('Mengelola variabel lingkungan (.env) lokal')
  .argument('[katalog]', 'Nama variabel (key)')
  .argument('[nilai]', 'Nilai variabel (value)')
  .action(async (katalog, nilai) => {
    await siapkanKonteks(program.opts());

    if (katalog && nilai !== undefined) {
      await Laras.simpanEnv(katalog, nilai);
      console.log(`✅ Berhasil menyimpan: ${katalog}=${nilai}`);
    } else if (katalog) {
      const env = await Laras.bacaEnv();
      console.log(`${katalog}=${env[katalog] || '(tidak disetel)'}`);
    } else {
      const env = await Laras.bacaEnv();
      console.log('📄 Konfigurasi Lokal (.env):');
      Object.entries(env).forEach(([k, v]) => {
        console.log(`  ${k}=${v}`);
      });
    }
  });

program.parse(process.argv);

#!/usr/bin/env bun
import { program } from 'commander';
import { Laras, Gudang, Pujangga, KonteksLaras, Arsip, Brankas } from '@lembaran/core';
import React from 'react';
import { render } from 'ink';
import fs from 'node:fs/promises';
import path from 'node:path';

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
const siapkanKonteks = async (opts: any): Promise<KonteksLaras> => {
  let konteks: KonteksLaras;

  if (opts.saku) konteks = 'saku';
  else if (opts.pelataran) konteks = 'pelataran';
  else konteks = await Laras.deteksiKonteksOtomatis();

  if (opts.ai && opts.ai !== 'none') {
    Pujangga.setProvider(opts.ai as any);
  }

  const jalur = await Laras.temukanJalur(konteks);
  await Gudang.inisialisasi(jalur);
  return konteks;
};

const bukaBrankasCLI = async () => {
  const prompts = (await import('prompts')).default;
  const res = await prompts({
    type: 'password',
    name: 'pw',
    message: 'Masukkan kata sandi brankas:'
  });
  if (!res.pw) return false;
  return await Arsip.unlockVault(res.pw);
};

// Alternate screen helpers
const masukLayarTUI = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

const keluarLayarTUI = () => {
  process.stdout.write('\x1b[?1049l');
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

program
  .command('layani')
  .description('Menjalankan API server lokal')
  .option('-p, --port <number>', 'Port server', '1401')
  .action(async (opts) => {
    await siapkanKonteks(program.opts());
    console.log('🔓 Mohon buka brankas terlebih dahulu.');
    if (await bukaBrankasCLI()) {
      const { mulaiServer } = await import('./Server.js');
      const server = await mulaiServer(parseInt(opts.port));
      console.log(`✅ Aktif di http://localhost:${server.port}`);
      console.log('Tekan Ctrl+C untuk berhenti.');
    } else {
      console.log('❌ Gagal membuka brankas.');
    }
  });

program
  .command('tanam')
  .description('Mengimpor berkas markdown (.md) ke brankas')
  .argument('<path>', 'Folder atau berkas yang akan ditanam')
  .action(async (p) => {
    await siapkanKonteks(program.opts());
    if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

    const stats = await fs.stat(p);
    const files = stats.isDirectory()
      ? (await fs.readdir(p)).filter(f => f.endsWith('.md')).map(f => path.join(p, f))
      : [p];

    console.log(`🌱 Menanam ${files.length} aksara...`);
    for (const f of files) {
      const content = await fs.readFile(f, 'utf8');
      const title = path.basename(f, '.md');
      await Arsip.saveNote({
        id: '', title, content,
        folderId: null, isPinned: false, isFavorite: false,
        tags: ['impor'], createdAt: new Date().toISOString()
      });
      console.log(`  ├── ✅ ${title}`);
    }
    console.log('✨ Selesai.');
  });

program
  .command('petik')
  .description('Mengekspor seluruh arsip ke berkas .lembaran')
  .action(async () => {
    await siapkanKonteks(program.opts());
    if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

    console.log('📦 Memetik seluruh aksara...');
    const notes = await Arsip.getAllNotes();
    const data = JSON.stringify(notes);
    const encrypted = await Brankas.encryptPacked(data);
    const filename = `lembaran-petikan-${new Date().toISOString().split('T')[0]}.lembaran`;
    await fs.writeFile(filename, encrypted);
    console.log(`✅ Berhasil dipetik ke: ${filename}`);
  });

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

    const { waitUntilExit } = render(React.createElement(LayarCepat), { exitOnCtrlC: true });

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

    const { waitUntilExit } = render(React.createElement(LayarCepat), { exitOnCtrlC: true });

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

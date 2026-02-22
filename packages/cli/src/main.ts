#!/usr/bin/env bun
import { program } from 'commander';
import { Laras, Gudang, Pujangga, KonteksLaras } from '@lembaran/core';
import { Antarmuka } from './Antarmuka';
import pc from 'picocolors';

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error(pc.red('\n❌ Terjadi kesalahan fatal (Rejection):'), reason);
});
process.on('uncaughtException', (error) => {
  console.error(pc.red('\n❌ Terjadi kesalahan fatal (Exception):'), error);
});

const VERSI = '3.3.0';

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

  if (process.env.DEBUG === 'true') console.log(pc.dim(`[DEBUG] Konteks: ${konteks}`));

  if (opts.ai) {
    Pujangga.setProvider(opts.ai as any);
  }

  const jalur = await Laras.temukanJalur(konteks);
  await Gudang.inisialisasi(jalur);
  return konteks;
};

// Default: TUI interaktif penuh
program.action(async () => {
  const konteks = await siapkanKonteks(program.opts());
  await Antarmuka.jalankan(konteks);
});

program
  .command('mulai')
  .description('Menjalankan Antarmuka Terminal Interaktif (TUI)')
  .action(async () => {
    const konteks = await siapkanKonteks(program.opts());
    await Antarmuka.jalankan(konteks);
  });

// === SUBCOMMANDS ===
program
  .command('pantau')
  .description('Memantau kesehatan dan integritas sistem')
  .action(async () => {
    const konteks = await siapkanKonteks(program.opts());
    await Antarmuka.aksiPantau(konteks);
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
      console.log(pc.green(`✅ Berhasil menyimpan: ${pc.bold(katalog)}=${nilai}`));
    } else if (katalog) {
      const env = await Laras.bacaEnv();
      console.log(`${pc.cyan(katalog)}=${env[katalog] || pc.dim('(tidak disetel)')}`);
    } else {
      const env = await Laras.bacaEnv();
      console.log(pc.bold('📄 Konfigurasi Lokal (.env):'));
      Object.entries(env).forEach(([k, v]) => {
        console.log(`  ${pc.cyan(k)}=${v}`);
      });
    }
  });

program.parse(process.argv);

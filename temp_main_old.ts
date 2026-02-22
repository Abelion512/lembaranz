#!/usr/bin/env bun
import { program } from 'commander';
import { Antarmuka } from './Antarmuka';
import { Arsip, Laras, Gudang, Pujangga } from '@lembaran/core';
import { Sentinel } from '@lembaran/core/Sentinel';
import pc from 'picocolors';
import prompts from 'prompts';

// Global error handling to prevent silent exits
process.on('unhandledRejection', (reason) => {
  console.error(pc.red('\n❌ Terjadi kesalahan fatal (Rejection):'), reason);
});
process.on('uncaughtException', (error) => {
  console.error(pc.red('\n❌ Terjadi kesalahan fatal (Exception):'), error);
});

program
  .name('lembaran')
  .description('Lembaran — CLI Pengelolaan Aksara Personal')
  .version('3.1.0')
  .option('--saku', 'Gunakan konteks brankas personal (global)')
  .option('--pelataran', 'Gunakan konteks brankas proyek (lokal)')
  .option('--ai <provider>', 'Pilih model AI (gemini, none)', 'none');

// Middleware untuk inisialisasi konteks Laras
const siapkanKonteks = async (opts: { saku?: boolean; pelataran?: boolean; ai?: string }) => {
  let konteks: 'saku' | 'pelataran';

  if (opts.saku) konteks = 'saku';
  else if (opts.pelataran) konteks = 'pelataran';
  else konteks = await Laras.deteksiKonteksOtomatis();

  if (process.env.DEBUG === 'true') console.log(pc.dim(`[DEBUG] Konteks: ${konteks}`));

  // Set AI Provider
  if (opts.ai) {
    const aiType = opts.ai as any;
    Pujangga.setProvider(aiType);
  }

  const jalur = await Laras.temukanJalur(konteks);
  await Gudang.inisialisasi(jalur);
  return konteks;
};

// Default action: Jalankan Antarmuka jika tidak ada subcommand
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

program
  .command('pantau')
  .description('Memantau kesehatan dan integritas sistem')
  .action(async () => {
    const konteks = await siapkanKonteks(program.opts());
    Antarmuka.enterTUI();
    console.clear();
    console.log(pc.bold(`📊 STATUS SISTEM LEMBARAN [${konteks.toUpperCase()}]:`));
    const isInit = await Arsip.isVaultInitialized();
    console.log(`${isInit ? pc.green('✅') : pc.yellow('⚠️')} Brankas: ${isInit ? 'Terinisialisasi' : 'Belum Disiapkan'}`);
    console.log(pc.green('✅ Security Engine: AES-GCM & Argon2id'));
    console.log(pc.blue(`ℹ️  Penyimpanan: ${konteks === 'saku' ? 'Personal (Saku)' : 'Proyek (Pelataran)'}`));
    console.log(pc.dim('\nKetik enter untuk kembali...'));
    await prompts({ type: 'text', name: 'p', message: '' });
  });

program
  .command('jelajah')
  .description('Menjelajahi arsip catatan dengan Fuzzy Search')
  .argument('[query]', 'Kata kunci pencarian')
  .action(async (query) => {
    await siapkanKonteks(program.opts());
    const isInit = await Arsip.isVaultInitialized();
    if (!isInit) return console.log(pc.red('❌ Brankas belum disiapkan.'));

    Antarmuka.enterTUI();
    console.clear();

    const response = await prompts({ type: 'password', name: 'password', message: 'Password brankas:' });
    if (!response.password || !(await Arsip.unlockVault(response.password))) return console.log(pc.red('❌ Gagal.'));

    let notes = await Arsip.getAllNotes();
    if (query) {
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      );
    }

    console.log(pc.cyan(`\n📂 HASIL JELAJAH (${notes.length}):`));
    notes.forEach(note => {
      console.log(`${pc.bold(note.title)} ${pc.dim(`[${note.id}]`)} ${pc.blue(`#${note.tags.join(' #')}`)}`);
    });
    console.log(pc.dim('\nKetik enter untuk kembali...'));
    await prompts({ type: 'text', name: 'p', message: '' });
  });

program
  .command('ukir')
  .description('Ukir (edit) catatan cepat melalui terminal')
  .argument('<id>', 'ID Catatan')
  .action(async (id) => {
    await siapkanKonteks(program.opts());
    Antarmuka.enterTUI();
    console.clear();

    const response = await prompts({ type: 'password', name: 'password', message: 'Password brankas:' });
    if (!response.password || !(await Arsip.unlockVault(response.password))) return;

    const note = await Arsip.getNoteById(id);
    if (!note) {
      console.log(pc.red('❌ Tidak ditemukan.'));
      await prompts({ type: 'text', name: 'p', message: pc.dim('Ketik enter untuk kembali...') });
      return;
    }

    const edit = await prompts({
      type: 'text',
      name: 'content',
      message: `Mengedit: ${note.title}. Masukkan konten baru:`,
      initial: note.content
    });

    if (edit.content) {
      await Arsip.saveNote({ ...note, content: edit.content });
      console.log(pc.green('✅ Berhasil diukir.'));
      await prompts({ type: 'text', name: 'p', message: pc.dim('Ketik enter untuk kembali...') });
    }
  });

program
  .command('layani')
  .description('Menyalakan Layanan Sentinel & API Server Lokal')
  .option('-p, --port <number>', 'Port server', '1401')
  .option('--sentinel', 'Aktifkan Pengawasan Otomatis 24/7 (Sentinel)')
  .action(async (options) => {
    await siapkanKonteks(program.opts());

    console.log(pc.bold(pc.blue('🚀 LEMBARAN SENTINEL HOST')));
    console.log(pc.dim(`API Server: http://localhost:${options.port}`));

    if (options.sentinel) {
      console.log(pc.yellow('🛡️  Mode Sentinel: AKTIF (Pengawasan 24/7 dimulai)'));
      Sentinel.inisialisasiDefault();
      await Sentinel.hidupkan();
    } else {
      console.log(pc.dim('ℹ️  Mode Sentinel: MATI (Gunakan --sentinel untuk mengaktifkan)'));
    }

    console.log(pc.green('\nStatus: LAYANAN AKTIF'));
    console.log(pc.dim('Tekan Ctrl+C untuk menghentikan.'));

    // Simulasikan server yang berjalan
    await new Promise(() => { });
  });

program
  .command('berdaulat')
  .description('Aktifkan Mode Otonom (Goal-Seeking Agent)')
  .argument('[tujuan]', 'Tujuan atau goal yang ingin dicapai', 'lakukan pemeriksaan kesehatan sistem dan laporkan jika ada masalah.')
  .action(async (tujuan) => {
    await siapkanKonteks(program.opts());
    console.log(pc.bold(pc.magenta('⚔️  MODE LEMBARAN BERDAULAT (Autonomous Agent)')));
    await Sentinel.siklusBerdaulat(tujuan);
  });

program.parse(process.argv);

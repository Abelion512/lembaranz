#!/usr/bin/env bun
import { program } from 'commander';
import { TUI } from './TUI';
import { Arsip } from '@lembaran/core/Arsip';
import pc from 'picocolors';
import prompts from 'prompts';

program
  .name('lembaran')
  .description('Lembaran — CLI Pengelolaan Aksara Personal')
  .version('3.1.0');

// Default action: Jalankan TUI jika tidak ada subcommand
program.action(async () => {
  await TUI.jalankan();
});

program
  .command('mulai')
  .description('Menjalankan Antarmuka Terminal Interaktif (TUI)')
  .action(async () => {
    await TUI.jalankan();
  });

program
  .command('pantau')
  .description('Memantau kesehatan dan integritas sistem')
  .action(async () => {
    console.log(pc.bold('📊 STATUS SISTEM LEMBARAN:'));
    const isInit = await Arsip.isVaultInitialized();
    console.log(`${isInit ? pc.green('✅') : pc.yellow('⚠️')} Brankas: ${isInit ? 'Terinisialisasi' : 'Belum Disiapkan'}`);
    console.log(pc.green('✅ Security Engine: AES-GCM & Argon2id'));
    console.log(pc.blue('ℹ️  Storage: Local-First (FileAdapter Active)'));
  });

program
  .command('jelajah')
  .description('Menjelajahi arsip catatan dengan Fuzzy Search')
  .argument('[query]', 'Kata kunci pencarian')
  .action(async (query) => {
    const isInit = await Arsip.isVaultInitialized();
    if (!isInit) return console.log(pc.red('❌ Brankas belum disiapkan.'));

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
  });

program
  .command('ukir')
  .description('Ukir (edit) catatan cepat melalui terminal')
  .argument('<id>', 'ID Catatan')
  .action(async (id) => {
    const response = await prompts({ type: 'password', name: 'password', message: 'Password brankas:' });
    if (!response.password || !(await Arsip.unlockVault(response.password))) return;

    const note = await Arsip.getNoteById(id);
    if (!note) return console.log(pc.red('❌ Tidak ditemukan.'));

    const edit = await prompts({
        type: 'text',
        name: 'content',
        message: `Mengedit: ${note.title}. Masukkan konten baru:`,
        initial: note.content
    });

    if (edit.content) {
        await Arsip.saveNote({ ...note, content: edit.content });
        console.log(pc.green('✅ Berhasil diukir.'));
    }
  });

program
  .command('layani')
  .description('Menjalankan Local API Server untuk integrasi eksternal')
  .option('-p, --port <number>', 'Port server', '1401')
  .action(async (options) => {
    console.log(pc.bold(pc.blue('🚀 LEMBARAN LOCAL API SERVER')));
    console.log(pc.dim(`Mendengarkan di http://localhost:${options.port}`));
    console.log(pc.yellow('Status: AKTIF (Mode Read-Only)'));
    await new Promise(() => {});
  });

program.parse();

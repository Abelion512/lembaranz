#!/usr/bin/env bun
import { program } from 'commander';
import { registrasiPerintahEnv } from './perintah/Env.js';
import { registrasiPerintahTanam } from './perintah/Tanam.js';
import { registrasiPerintahPetik } from './perintah/Petik.js';
import { registrasiPerintahPengaturan } from './perintah/Pengaturan.js';
import { registrasiPerintahPantau } from './perintah/Pantau.js';
import { registrasiPerintahKeamanan } from './perintah/Keamanan.js';
import { registrasiPerintahMulai, jalankanTUI } from './perintah/Mulai.js';
import { siapkanKonteks } from './utils.js';
import pkg from '../package.json' assert { type: 'json' };

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Terjadi kesalahan fatal (Rejection):', reason);
});
process.on('uncaughtException', (error) => {
  console.error('\n❌ Terjadi kesalahan fatal (Exception):', error);
});

const VERSI = pkg.version;

program
  .name('lembaran')
  .description('Lembaran — CLI Pengelolaan Aksara Personal')
  .version(VERSI)
  .option('--saku', 'Gunakan konteks brankas personal (global)')
  .option('--pelataran', 'Gunakan konteks brankas proyek (lokal)')
  .option('--ai <provider>', 'Pilih model AI (gemini, none)', 'none');

// Register all commands
registrasiPerintahEnv(program);
registrasiPerintahTanam(program);
registrasiPerintahPetik(program);
registrasiPerintahPengaturan(program);
registrasiPerintahPantau(program, VERSI);
registrasiPerintahKeamanan(program);
registrasiPerintahMulai(program, VERSI);

// Default: TUI interaktif penuh
program.action(async () => {
  const konteks = await siapkanKonteks(program.opts());
  await jalankanTUI(konteks, VERSI);
});

program.parse(process.argv);

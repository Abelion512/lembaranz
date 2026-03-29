import { Command } from 'commander';
import { siapkanKonteks, bukaBrankasCLI } from '../utils.js';
import { jalankanTUI } from './Mulai.js';

export function registrasiPerintahJelajah(program: Command, versi: string) {
  program
    .command('jelajah [keyword]')
    .description('Mencari catatan dalam arsip menggunakan kata kunci')
    .action(async (keyword) => {
      // 1. Siapkan konteks (saku/pelataran)
      const konteks = await siapkanKonteks(program.opts());

      // 2. Buka brankas (Wajib untuk akses arsip)
      console.log('🔓 Membuka brankas untuk mengakses arsip...');
      const sukses = await bukaBrankasCLI();
      
      if (!sukses) {
        console.log('❌ Gagal membuka brankas. Pencarian dibatalkan.');
        return;
      }

      // 3. Jalankan TUI langsung ke layar Jelajah dengan filter keyword
      await jalankanTUI(konteks, versi, 'jelajah', keyword);
    });
}

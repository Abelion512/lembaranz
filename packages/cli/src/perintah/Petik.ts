import { Command } from 'commander';
import { Arsip } from '@abelionorg/core';
import fs from 'node:fs/promises';
import prompts from 'prompts';
import { siapkanKonteks, bukaBrankasCLI } from '../utils.js';

export function registrasiPerintahPetik(program: Command) {
  program
    .command('petik')
    .description('Mengekspor seluruh arsip ke berkas .lembaran (Portabel & Terenkripsi)')
    .action(async () => {
      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      console.log('📦 Memetik seluruh aksara...');

      // Minta password khusus untuk backup ini
      const res = await prompts({
          type: 'password',
          name: 'pw',
          message: 'Tetapkan kata sandi untuk file cadangan ini (Bisa sama dengan brankas):',
          validate: (val: string) => val.length > 0 ? true : 'Kata sandi tidak boleh kosong'
      });

      if (!res.pw) {
          console.log('❌ Ekspor dibatalkan.');
          return;
      }

      try {
        const hasil = await Arsip.cadangkan(res.pw);
        if (hasil.error) {
          console.error('❌ Gagal mengekspor:', hasil.error.message);
          return;
        }

        const buffer = hasil.data!;
        const filename = `lembaran-petikan-${new Date().toISOString().split('T')[0]}.lembaran`;

        await fs.writeFile(filename, buffer);
        console.log(`✅ Berhasil dipetik ke: ${filename}`);
        console.log(`🔐 File ini aman dan portabel. Gunakan password tadi untuk membukanya di mesin lain.`);
      } catch (err) {
        console.error('❌ Gagal mengekspor:', err);
      }
    });
}

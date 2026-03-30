import { Command } from 'commander';
import { Arsip } from '@lembaranz/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import prompts from 'prompts';
import { siapkanKonteks, bukaBrankasCLI } from '../utils.js';

export function registrasiPerintahTanam(program: Command) {
  program
    .command('tanam')
    .description('Mengimpor berkas (.md) atau memulihkan cadangan (.lembaran)')
    .argument('<path>', 'Folder atau berkas yang akan ditanam')
    .action(async (p) => {
      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      const stats = await fs.stat(p);
      const isDir = stats.isDirectory();

      // Kasus 1: Direktori (Cari .md)
      if (isDir) {
        const files = (await fs.readdir(p)).filter(f => f.endsWith('.md')).map(f => path.join(p, f));
        console.log(`🌱 Menanam ${files.length} aksara dari direktori...`);
        for (const f of files) {
            await tanamMarkdown(f);
        }
        console.log('✨ Selesai.');
        return;
      }

      // Kasus 2: File .lembaran (Restore Backup)
      if (p.endsWith('.lembaran')) {
        console.log('🔄 Mendeteksi file cadangan portabel (.lembaran)');
        const buffer = await fs.readFile(p);

        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Masukkan kata sandi file cadangan ini:',
        });

        if (!res.pw) return console.log('❌ Dibatalkan.');

        try {
            console.log('⏳ Sedang memulihkan dan mengenkripsi ulang data...');
            const hasil = await Arsip.pulihkan(buffer, res.pw);
            if (hasil.error) {
                console.error('❌ Gagal memulihkan:', hasil.error.message);
                return;
            }

            const { restored, skipped } = hasil.data!;
            console.log(`✅ Pemulihan selesai:`);
            console.log(`   - Dipulihkan: ${restored} catatan`);
            console.log(`   - Dilewati (Lebih baru): ${skipped} catatan`);
        } catch (err) {
            console.error('❌ Gagal memulihkan:', err instanceof Error ? err.message : err);
        }
        return;
      }

      // Kasus 3: File Tunggal .md
      if (p.endsWith('.md')) {
          await tanamMarkdown(p);
          console.log('✨ Selesai.');
          return;
      }

      console.log('❌ Format file tidak didukung. Gunakan .md atau .lembaran');
    });
}

async function tanamMarkdown(filepath: string) {
    const content = await fs.readFile(filepath, 'utf8');
    const title = path.basename(filepath, '.md');
    const hasil = await Arsip.saveNote({
      id: '', title, content,
      folderId: null, isPinned: false, isFavorite: false,
      tags: ['impor'], createdAt: new Date().toISOString()
    });

    if (hasil.error) {
        console.log(`  ├── ❌ Gagal menanam ${title}: ${hasil.error.message}`);
    } else {
        console.log(`  ├── ✅ ${title}`);
    }
}

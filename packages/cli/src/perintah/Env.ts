import { Command } from 'commander';
import { Arsip } from '@lembaran/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { type ChildProcess } from 'node:child_process';
import { siapkanKonteks, bukaBrankasCLI } from '../utils.js';
import prompts from 'prompts';

export function registrasiPerintahEnv(program: Command) {
  const envCmd = program
    .command('env')
    .description('Manajemen file .env lokal lintas proyek (Brankas tersentralisasi)');

  envCmd
    .command('simpan')
    .description('Menyimpan file .env lokal ke brankas')
    .argument('[tag]', 'Nama tag/proyek (default: nama direktori saat ini)')
    .action(async (tag) => {
      // Access parent command options if needed, but context is usually global
      // Note: commander might pass options as the second argument if arguments are defined
      // We need to get global options from program.opts()
      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      const targetTag = tag || path.basename(process.cwd());
      const envPath = path.join(process.cwd(), '.env');

      try {
        const content = await fs.readFile(envPath, 'utf8');
        const title = `.env - ${targetTag}`;

        const notes = await Arsip.getAllNotes();
        const existing = notes.find(n => n.title === title && n.tags.includes('env'));

        if (existing) {
          const fullNote = await Arsip.getNoteById(existing.id);
          if (fullNote) {
            fullNote.content = content;
            fullNote.updatedAt = new Date().toISOString();
            await Arsip.saveNote(fullNote);
            console.log(`✅ Berhasil memperbarui profil .env: ${targetTag}`);
            return;
          }
        }

        await Arsip.saveNote({
          id: '', title, content,
          folderId: null, isPinned: false, isFavorite: false,
          tags: ['env', targetTag], createdAt: new Date().toISOString()
        });
        console.log(`✅ Berhasil menyimpan profil .env: ${targetTag} ke dalam brankas.`);
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'ENOENT') {
          console.log('❌ File .env tidak ditemukan di direktori saat ini.');
        } else {
          console.log(`❌ Gagal menyimpan: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    });

  envCmd
    .command('muat')
    .alias('ambil')
    .description('Memuat file .env dari brankas ke direktori lokal')
    .argument('<tag>', 'Nama tag/proyek')
    .action(async (tag) => {
      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      const title = `.env - ${tag}`;
      const notes = await Arsip.getAllNotes();
      const existingHeader = notes.find(n => n.title === title && n.tags.includes('env'));

      if (!existingHeader) {
        return console.log(`❌ Profil .env dengan tag '${tag}' tidak ditemukan di brankas.`);
      }

      const fullNote = await Arsip.getNoteById(existingHeader.id);
      if (!fullNote) {
        return console.log(`❌ Gagal mendekripsi profil .env '${tag}'.`);
      }

      const envPath = path.join(process.cwd(), '.env');
      try {
        // Cek apakah file .env sudah ada dan minta konfirmasi
        let shouldOverwrite = true;
        try {
          await fs.access(envPath);
          // File exists, ask for confirmation
          const response = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: 'File .env sudah ada. Timpa?',
            initial: false
          });
          if (!response.confirm) {
            console.log('❌ Operasi dibatalkan. File .env tidak ditimpa.');
            return;
          }
        } catch {
          // File doesn't exist, proceed
          shouldOverwrite = true;
        }

        if (shouldOverwrite) {
          await fs.writeFile(envPath, fullNote.content, 'utf8');
          console.log(`✅ Berhasil memuat profil .env '${tag}' ke ${envPath}`);
        }
      } catch (e: unknown) {
        console.log(`❌ Gagal menulis file .env: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  envCmd
    .command('daftar')
    .alias('senarai')
    .description('Menampilkan daftar profil .env yang tersimpan di brankas')
    .action(async () => {
      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      const notes = await Arsip.getAllNotes();
      const envNotes = notes.filter(n => n.tags.includes('env') && n.title.startsWith('.env - '));

      if (envNotes.length === 0) {
        return console.log('📂 Belum ada profil .env yang tersimpan di brankas.');
      }

      console.log('📄 Daftar Profil .env Tersimpan:');
      envNotes.forEach(n => {
        const tag = n.title.replace('.env - ', '');
        console.log(`  - ${tag} (Disimpan: ${new Date(n.updatedAt || n.createdAt).toLocaleString('id-ID')})`);
      });
    });

  program
    .command('run')
    .description('Menempelkan environment dari brankas lalu mengeksekusi sub-perintah (Zonal Context Injection)')
    .option('-t, --tag <tag>', 'Nama profil .env spesifik (default: nama direktori)')
    .argument('<command...>', 'Perintah eksekusi yang akan di-spawn (contoh: npm start)')
    .allowUnknownOption()
    .action(async (commandArgs, options) => {
      const targetTag = options.tag || path.basename(process.cwd());
      const actualCommand = commandArgs;

      if (!actualCommand || actualCommand.length === 0) {
        return console.log('❌ Anda harus memasukkan perintah yang akan dijalankan. Contoh: lembaran run npm start');
      }

      await siapkanKonteks(program.opts());
      if (!(await bukaBrankasCLI())) return console.log('❌ Akses ditolak.');

      const title = `.env - ${targetTag}`;
      const notes = await Arsip.getAllNotes();
      const existingHeader = notes.find(n => n.title === title && n.tags.includes('env'));

      if (!existingHeader) {
        return console.log(`❌ Profil .env dengan tag '${targetTag}' tidak ditemukan di brankas.`);
      }

      const fullNote = await Arsip.getNoteById(existingHeader.id);
      if (!fullNote) {
        return console.log(`❌ Gagal mendekripsi profil .env '${targetTag}'.`);
      }

      // Parsing raw .env text to an object
      const parsedEnv: Record<string, string> = {};
      for (const line of fullNote.content.split('\n')) {
        const clean = line.trim();
        if (clean && !clean.startsWith('#')) {
          const index = clean.indexOf('=');
          if (index !== -1) {
            const key = clean.substring(0, index).trim();
            let val = clean.substring(index + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            parsedEnv[key] = val;
          }
        }
      }

      // Command string & args
      const cmd = actualCommand[0];
      const args = actualCommand.slice(1);

      console.log(`⚡ Menginjeksi konteks terisolasi '${targetTag}'...`);

      const child = (await import('node:child_process')).spawn(cmd, args, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, ...parsedEnv }
      }) as ChildProcess;

      child.on('error', (err: Error) => {
        console.error(`❌ Gagal menjalankan proses: ${err.message}`);
      });

      child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        process.exitCode = code ?? (signal ? 1 : 0);
      });
    });
}

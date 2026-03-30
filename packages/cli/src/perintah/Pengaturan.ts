import { Command } from 'commander';
import { Laras } from '@lembaranz/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { siapkanKonteks } from '../utils.js';

export function registrasiPerintahPengaturan(program: Command) {
  program
    .command('pengaturan')
    .alias('config')
    .description('Mengelola variabel lingkungan (.env) lokal atau pengaturan repo')
    .option('--pasang-hook', 'Memasang Git Hook Pre-commit pencegah kebocoran rahasia')
    .argument('[katalog]', 'Nama variabel (key)')
    .argument('[nilai]', 'Nilai variabel (value)')
    .action(async (katalog, nilai, options) => {
      if (options.pasangHook) {
        const gitHooksPath = path.join(process.cwd(), '.git', 'hooks');
        try {
          await fs.access(gitHooksPath);
        } catch {
          return console.log('❌ Direktori .git/hooks tidak ditemukan. Pastikan Anda berada dalam direktori repositori Git.');
        }

        const hookFile = path.join(gitHooksPath, 'pre-commit');
        const hookContent = `#!/bin/bash
# Lembaran Pre-commit Secret Scanner

echo "🔍 [Lembaran SEC] Memindai file staged untuk hardcoded secrets..."

# Pola Regex Kredensial Umum (Diobvuskasi dari deteksi dirinya sendiri)
P1="AWS_ACCESS_KEY"_"ID"
P2="AWS_SECRET_ACCESS"_"KEY"
P3="-----BEGIN PRIVATE"_" KEY-----"
P4="eyJhbGc"_"iOi"
P5="Bearer [A-Za-z0-9\\-\\._~\\+/]+=*"

PATTERN="($P1|$P2|$P3|$P4|$P5)"

staged_files=$(git diff --cached --name-only --diff-filter=ACM)
has_secrets=0

for file in $staged_files; do
  if git show ":$file" | grep -qE "$PATTERN"; then
    echo "❌ KEBOCORAN TERDETEKSI pada file: $file"
    has_secrets=1
  fi
done

if [ $has_secrets -eq 1 ]; then
  echo ""
  echo "🚨 Peringatan Keamanan Lembaran!"
  echo "Commit dibatalkan karena terdeteksi keberadaan teks kunci rahasia (hardcoded)."
  echo "💡 Saran: Simpan variabel lingkungan di brankas dengan perintah: lembaran env simpan [tag]"
  echo "          dan panggil menggunakan metode Zonal Context Injection: lembaran run."
  echo ""
  exit 1
fi

echo "✅ 스 Pemindaian bersih. Mengizinkan komit."
exit 0
`;
        await fs.writeFile(hookFile, hookContent, { mode: 0o755 });
        return console.log('✨ Berhasil memasang Pre-commit Secret Scanner Lembaran di direktori ini.');
      }

      await siapkanKonteks(program.opts());

      if (katalog && nilai !== undefined) {
        const hasil = await Laras.simpanEnv(katalog, nilai);
        if (hasil.error) {
          console.error(`❌ Gagal menyimpan: ${hasil.error.message}`);
        } else {
          console.log(`✅ Berhasil menyimpan: ${katalog}=${nilai}`);
        }
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
}

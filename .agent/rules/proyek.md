# 🏗️ Lembaran Workspace Rules

Aturan khusus untuk pengerjaan di repositori Lembaran:

1. **Struktur Monorepo**: Pastikan perubahan di `@lembaran/core` diuji dampaknya terhadap `@lembaran/cli` dan `@lembaran/web`.
2. **Kedaulatan Konteks**: Selalu cek apakah perintah harus dijalankan dengan flag `--saku` atau `--pelataran`. Default untuk proyek adalah `--pelataran`.
3. **Penyimpanan**: Gunakan `FileAdapter` sebagai satu-satunya adapter penyimpanan untuk lingkungan pengembangan lokal.
4. **Pujangga Modular**: Jangan memodifikasi penyedia AI tanpa memperbarui interface `PujanggaProvider`.

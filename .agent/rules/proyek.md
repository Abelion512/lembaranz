# 🏗️ Lembaran Workspace Rules

Aturan khusus untuk pengerjaan di repositori Lembaran:

1. **Struktur Monorepo**: Pastikan perubahan di `@lembaran/core` diuji dampaknya terhadap `@lembaran/cli` dan `@lembaran/web`.
2. **Kedaulatan Konteks**: Selalu cek apakah perintah harus dijalankan dengan flag `--saku` atau `--pelataran`. Default untuk proyek adalah `--pelataran`.
3. **Penyimpanan**: Gunakan `FileAdapter` sebagai satu-satunya adapter penyimpanan untuk lingkungan pengembangan lokal.
4. **Pujangga Modular**: Jangan memodifikasi penyedia AI tanpa memperbarui interface `PujanggaProvider`.
5. **Kewajiban Dokumentasi**: Setiap pembaruan kode **WAJIB** disertai dengan pembaruan dokumentasi (konteks, guidelines, UI teks) yang berkaitan dengan fungsionalitas kode yang diubah.
6. **Keamanan Deployment (Sentinel Rule)**: **DILARANG KERAS** melakukan deployment atau push ke lingkungan **Production** (`main` branch atau domain produksi) tanpa izin eksplisit dari USER.
7. **Pemisahan Branch**: Branch `#33` dan `main` sengaja dibedakan secara desain; jangan mencoba menyinkronkan keduanya kecuali atas instruksi USER.


Lembaran CLI adalah pendamping setia bagi para pengembang. Ia dirancang untuk kecepatan, otomatisasi, dan kemudahan integrasi dengan alur kerja terminal Anda.

## Instalasi

### Menggunakan Bun (Sangat Direkomendasikan)
Bun adalah runtime tercepat untuk menjalankan Lembaran CLI.
```bash
bun install -g Abelion512/lembaran
```

### Menggunakan NPM
```bash
npm install -g Abelion512/lembaran
```

## Troubleshooting Instalasi

Jika Anda mengalami masalah "Module not found" atau perintah `lembaran` merujuk ke path lama (`abelion-notes`), lakukan pembersihan cache global:

```bash
bun remove -g abelion-notes lembaran
# ATAU jika menggunakan npm
npm uninstall -g abelion-notes lembaran
```

Setelah itu, ulangi proses instalasi.

## Menjalankan CLI

Setelah instalasi, perintah `lembaran` akan tersedia secara global.

### 1. Mode Interaktif (TUI)
Ketik perintah berikut untuk masuk ke antarmuka visual terminal:
```bash
lembaran mulai
```

### 2. Mode Perintah Langsung
Anda juga dapat menjalankan perintah spesifik tanpa masuk ke menu utama:
```bash
lembaran pantau    # Melihat status sistem
lembaran jelajah   # Mencari catatan
```

## Aksara Shell Prompt

Saat Anda menjalankan `lembaran mulai`, Anda akan memasuki **Aksara Shell**. Prompt akan berubah menjadi `aksara ❯`. Di sini, Anda dapat mengetikkan perintah secara langsung tanpa awalan `lembaran`.

Contoh:
- `pantau`
- `jelajah "Server Config"`
- `ukir` (untuk membuat catatan baru)

## Perintah Pengaturan (Config)

Salah satu fitur terkuat Lembaran CLI adalah kemampuannya mengelola konfigurasi `.env` secara langsung tanpa harus membuka editor teks. Ini sangat berguna untuk menyimpan kredensial API atau konfigurasi proyek dengan cepat.

### Contoh Penggunaan:

1. **Melihat semua konfigurasi:**
   ```bash
   lembaran pengaturan
   ```
2. **Melihat nilai spesifik:**
   ```bash
   lembaran pengaturan GEMINI_API_KEY
   ```
3. **Menyimpan/Memperbarui nilai:**
   ```bash
   lembaran pengaturan GEMINI_API_KEY "isi-api-key-anda"
   ```

## Retensi Jangka Panjang & Keamanan

Lembaran dirancang agar data Anda tetap aman dan dapat diakses selama bertahun-tahun:

1.  **Backup Mandiri**: Gunakan perintah `petik` di menu utama untuk mengekspor seluruh brankas Anda menjadi satu file `.lembaran` yang terenkripsi. Simpan file ini di tempat aman (cloud pribadi atau drive fisik).
2.  **Impor Mudah**: Jika Anda berganti perangkat, cukup instal Lembaran CLI dan gunakan fitur `tanam` untuk mengembalikan seluruh arsip Anda.
3.  **Local-First, Privacy-Always**: Folder `.lembaran/` di root proyek Anda berisi basis data lokal. Kami telah memastikan folder ini otomatis masuk dalam `.gitignore` jika Anda menggunakan CLI, sehingga rahasia Anda tidak akan pernah bocor ke GitHub secara tidak sengaja.
4.  **Kedaulatan AI**: Dengan menggunakan `lembaran pengaturan`, Anda dapat dengan mudah mengganti provider AI (Gemini, dsb) kapan saja tanpa mengubah kode aplikasi.

---
*Dibuat dengan ❤️ untuk para pengukir aksara yang mendambakan kebebasan digital.*

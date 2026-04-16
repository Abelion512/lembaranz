
Lembaranz CLI adalah alat bantu utama untuk pengelolaan data. Ia dirancang untuk kecepatan, otomatisasi, dan kemudahan integrasi dengan alur kerja terminal Anda.

## Instalasi

### Menggunakan Bun (Sangat Direkomendasikan)
Bun adalah runtime tercepat untuk menjalankan Lembaranz CLI.
```bash
bun install -g Abelion512/lembaranz
```

### Menggunakan NPM
```bash
npm install -g Abelion512/lembaranz
```

## Menjalankan CLI

Setelah instalasi, perintah `lembaranz` akan tersedia secara global.

### 1. Mode Interaktif (TUI)
Ketik perintah berikut untuk masuk ke antarmuka visual terminal yang intuitif:
```bash
lembaranz mulai
```
Inside the TUI, you can navigate using arrow keys. Navigation is non-looping for better control.

### 2. Mode Perintah Langsung
Anda juga dapat menjalankan perintah spesifik tanpa masuk ke menu utama:
```bash
lembaranz pantau    # Melihat status sistem
lembaranz jelajah   # Mencari catatan
lembaranz pengaturan # Mengelola konfigurasi .env
```

## Perintah Pengaturan (Config)

Salah satu fitur terkuat Lembaranz CLI adalah kemampuannya mengelola konfigurasi `.env` secara langsung tanpa harus membuka editor teks. Ini sangat berguna untuk menyimpan kredensial API atau konfigurasi proyek dengan cepat.

### Contoh Penggunaan:

1. **Melihat semua konfigurasi:**
   ```bash
   lembaranz pengaturan
   ```
2. **Melihat nilai spesifik:**
   ```bash
   lembaranz pengaturan GEMINI_API_KEY
   ```
3. **Menyimpan/Memperbarui nilai:**
   ```bash
   lembaranz pengaturan GEMINI_API_KEY "isi-api-key-anda"
   ```

## Retensi Jangka Panjang & Keamanan

Lembaranz dirancang agar data Anda tetap aman dan dapat diakses selama bertahun-tahun:

1.  **Backup Mandiri**: Gunakan perintah `petik` di menu utama untuk mengekspor seluruh brankas Anda menjadi satu file `.lembaranz` yang terenkripsi. Simpan file ini di tempat aman (cloud pribadi atau drive fisik).
2.  **Impor Mudah**: Jika Anda berganti perangkat, cukup instal Lembaranz CLI dan gunakan fitur `tanam` untuk mengembalikan seluruh arsip Anda.
3.  **Local-First, Privacy-Always**: Folder `.lembaranz/` di root proyek Anda berisi basis data lokal. Kami telah memastikan folder ini otomatis masuk dalam `.gitignore` jika Anda menggunakan CLI, sehingga rahasia Anda tidak akan pernah bocor ke GitHub secara tidak sengaja.
4.  **Kedaulatan AI**: Dengan menggunakan `lembaranz pengaturan`, Anda dapat dengan mudah mengganti provider AI (Gemini, dsb) kapan saja tanpa mengubah kode aplikasi.

---
*Dibuat untuk kebebasan digital dan kemandirian data.*

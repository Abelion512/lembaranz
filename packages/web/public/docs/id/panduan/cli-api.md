# CLI API Reference

`lembaran` (atau `lembaran`) adalah antarmuka baris perintah untuk manajemen Lembaran.

## Instalasi
```bash
curl -fsSL https://lembaran.vercel.app/install.sh | bash
# atau (dari root repositori)
bun install -g ./packages/cli
# atau (via npm)
npm install -g Abelion512/lembaran
```

## Pilihan Konteks (Vault Context)
CLI Lembaran mendukung dua jenis konteks penyimpanan:
- **`--saku`**: Menggunakan brankas personal global yang tersimpan di `~/.lembaran/saku.json`. Cocok untuk catatan pribadi lintas proyek.
- **`--pelataran`**: Menggunakan brankas proyek lokal yang tersimpan di folder `.lembaran/` pada akar proyek. Data bersifat lokal dan privat untuk proyek tersebut.

*Secara otomatis, CLI akan mendeteksi jika Anda berada di dalam folder proyek Lembaran.*

## Perintah Dasar

### `lembaran mulai`
Menjalankan TUI (Terminal User Interface) interaktif.
- **Navigasi**: Gunakan Panah Atas/Bawah.
- **Pilih**: Tekan Enter.
- **Keluar**: Tekan Esc atau pilih menu Keluar.

### `lembaran pantau`
Menampilkan status kesehatan sistem:
- Ketersediaan Enkripsi (Sentinel).
- Status Database (IndexedDB/File).
- Versi Aplikasi.

### `lembaran jelajah`
Menampilkan daftar catatan yang tersimpan (ID, Judul, Tanggal).
- Output terenkripsi jika brankas terkunci.

### `lembaran kuncung`
Membuka kunci brankas (Login).
- Meminta input password secara aman.
- Mendukung verifikasi via Web (jika diaktifkan).

### `lembaran tanam <file>`
Mengimport file teks eksternal ke dalam arsip.
- Contoh: `lembaran tanam catatanku.txt`

### `lembaran petik <id>`
Mengekspor catatan ke format teks.
- Contoh: `lembaran petik note_123`

### `lembaran hangus <id>`
Menghapus catatan secara permanen.
- **Perhatian**: Tindakan ini tidak dapat dibatalkan.

### `lembaran pengaturan [key] [value]`
Mengelola konfigurasi variabel lingkungan (`.env`) lokal secara mandiri.
- **Tanpa Argumen**: Menampilkan daftar seluruh konfigurasi yang tersimpan.
- **Key saja**: Menampilkan nilai dari variabel tertentu.
- **Key & Value**: Menyimpan kredensial baru (misal: `GEMINI_API_KEY`) ke file `.env` lokal proyek.

*Sangat berguna untuk setup self-hosted kredensial AI tanpa perlu mengedit file teks manual.*

## Struktur Data (JSON)
Jika menggunakan penyimpanan file (`.lembaran-db.json`), struktur data adalah:
```json
{
  "meta": { "version": "2.4.0" },
  "notes": { ... },
  "folders": { ... }
}
```

# CLI API Reference

`lembaran` (atau `lembaran`) adalah antarmuka baris perintah untuk manajemen Lembaran.

## Instalasi
```bash
curl -fsSL https://lembaran.vercel.app/install.sh | bash
# atau (dari root repositori)
bun install -g ./packages/cli
# atau
ln -s ./bin/lembaran /usr/local/bin/lembaran
```

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

## Struktur Data (JSON)
Jika menggunakan penyimpanan file (`.lembaran-db.json`), struktur data adalah:
```json
{
  "meta": { "version": "2.4.0" },
  "notes": { ... },
  "folders": { ... }
}
```

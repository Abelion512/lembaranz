# Walkthrough: Struktur Monorepo & Rebranding 'Lembaran'

Implementasi penuh dari visi **Lembaran** kini telah mencapai milestone besar dengan migrasi ke arsitektur monorepo dan rebranding total.

## 1. Arsitektur Monorepo (Bun Workspaces)
Proyek ini sekarang dibagi menjadi tiga paket utama untuk pemisahan tanggung jawab yang lebih baik:

- **`packages/core`**: Jiwa aplikasi. Berisi logika enkripsi (Sentinel), manajemen storage (Gudang), dan model data (Aksara).
- **`packages/cli`**: Antarmuka terminal. Menyediakan TUI puitis untuk pengguna power user.
- **`packages/web`**: Antarmuka grafis (GUI) berbasis Next.js. Mencakup landing page marketing dan dashboard arsip.

## 2. Rebranding: Dari Abelion ke Lembaran
Nama "Abelion" telah sepenuhnya diganti dengan **Lembaran**.
- Semua referensi di kode sumber, metadata, dan dokumentasi telah disinkronkan.
- Domain imajiner dialihkan ke `lembaran.ai`.
- Filosofi "Berdikari" diperkuat sebagai pilar utama branding.

## 3. Landing Page & UX Baru
Halaman utama (`/`) kini berfungsi sebagai gerbang informasi:
- **Widget Instalasi**: Cara cepat memasang CLI via berbagai package manager.
- **Tabel Perbandingan**: Panduan memilih antara CLI (Master), WEB (Junior), atau APP (Explorer).
- **Dashboard (`/arsip`)**: Aplikasi utama kini berada di sub-path terproteksi.

## 4. CLI Puitis: `lembaran`
CLI tetap menjadi fitur unggulan dengan kosa kata puitis:
| Perintah | Deskripsi |
|----------|-----------|
| `mulai` | Gerbang Utama TUI |
| `pantau` | Penjaga Menara (Status) |
| `jelajah` | Penelusur Lorong (List) |

## 5. Deployment & Performa
- **Vercel**: Menggunakan konfigurasi monorepo dengan `output: standalone`.
- **Local-First**: Tetap menggunakan IndexedDB (Web) dan JSON Local (CLI) yang disatukan oleh Adapter Pattern di `@lembaran/core`.

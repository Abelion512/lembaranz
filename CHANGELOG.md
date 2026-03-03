# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.
## [3.0.0] - 2026-02-18
### Added
- **Vim Mode**: Navigasi editor menggunakan shortcut H J K L (Normal/Insert Mode).
- **Otentikasi Biometrik**: Dukungan UI dan simulasi WebAuthn (Touch/FaceID).
- **Vault Terenkripsi (.lembaran)**: Ekspor cadangan yang dilindungi kunci brankas utama.
- **Impor Markdown**: Alat pengunggah catatan massal dari file .md.
- **Fuzzy Search CLI**: Pencarian cerdas pada perintah `jelajah`.
- **Ukir CLI (Mini-Editor)**: Edit catatan langsung dari terminal.
- **Peta Memori Pro**: Peningkatan visualisasi graph dengan zoom dan interaksi simpul.

## [2.9.0] - 2026-02-18
### Added
- **Panic Key (Protokol Darurat)**: Penghapusan data instan jika kata sandi darurat dimasukkan.
- **Session Timeout**: Kunci otomatis brankas setelah durasi yang ditentukan.
- **Sound Design**: Feedback audio halus untuk aksi buka/kunci brankas.
- **Password Strength Meter**: Indikator kekuatan sandi real-time.
- **Storage Stats & Dead Link Checker**: Alat pemeliharaan database di halaman Laras Data.
- **Local API Server**: Perintah `lembaran layani` untuk integrasi eksternal.
- **Dukungan PWA**: Manifest aplikasi untuk instalasi offline.
### Fixed
- **Build Error**: Perbaikan duplikasi import pada landing page.

## [2.8.0] - 2026-02-18
### Added
- **Hero Section Dinamis**: Judul dengan efek siklus kata dan layout gaya Claude Code.
- **Preview Kustomisasi**: Komponen interaktif untuk melihat adaptasi tema warna secara real-time.
- **Instalasi GitHub**: Dukungan perintah `npm` dan `bun` via shorthand GitHub.
### Changed
- **Refinement Deskripsi**: Ukuran font deskripsi diperkecil agar lebih proporsional.
- **Klarifikasi Biometrik**: Penjelasan status "Planned" untuk transparansi roadmap.

## [2.7.0] - 2026-02-18
### Added
- **Skrip Instalasi Cerdas**: `install.sh` untuk instalasi otomatis Bun dan Lembaran CLI di WSL/Linux.
- **Status "Coming Soon"**: Indikator status untuk metode instalasi yang belum aktif di landing page.
### Changed
- **Tipografi Hero**: Headline lebih elegan (6xl) dengan jarak huruf yang lebih lega.
- **Ukuran Tombol**: Tombol landing page lebih proporsional dan modern.
- **Konfigurasi Bin**: Mendaftarkan perintah `lembaran` secara global melalui package metadata.


## [2.6.0] - 2026-02-18
### Added
- **Virtualisasi Daftar**: Implementasi `react-window` di halaman Arsip untuk menangani ribuan catatan dengan mulus.
- **Smart Find Search**: Pengindeksan latar belakang untuk pencarian instan di dalam isi catatan terenkripsi.
- **Dokumentasi Publik**: Halaman baru `/bantuan/publik` yang dapat diakses tanpa membuka brankas.
- **Fitur "Beri Tahu Saya"**: Tombol notifikasi untuk ekosistem native yang akan datang.
- **Skrip Benchmark**: Perintah `bun run test:perf` untuk pengujian beban 1000 catatan.
### Fixed
- **GitHub 404**: Memperbaiki tautan repositori global dari `Lembaran512` ke `Abelion512`.
- **Content Leak**: Memastikan highlight pencarian tidak membocorkan data mentah base64.


## [2.5.0] - 2026-02-18
### Added
- **Landing Page Premium**: Halaman depan baru di `/` dengan widget instalasi CLI (curl, npm, bun, brew, paru).
- **Struktur Monorepo**: Migrasi ke Bun Workspaces (`packages/core`, `packages/cli`, `packages/web`).
- **Tabel Perbandingan**: Informasi detail perbedaan fitur antara versi CLI, WEB, dan APP (Native).
- **Showcase Native**: Placeholder untuk ekosistem aplikasi native (iOS, Android, Desktop).
- **Penyaring Rute**: Komponen `PenyaringRute` untuk mengelola visibilitas layout publik vs privat.
### Changed
- **Rebranding Total**: Menghapus semua referensi "Abelion" dan menggantinya dengan "Lembaran".
- **Dashboard Path**: Memindahkan dashboard utama ke `/arsip`.
- **Core Refactor**: Memisahkan logika inti ke `@lembaran/core` untuk mendukung multi-package.
- **Vercel Config**: Optimasi build monorepo dengan `standalone` output.

## [2.4.0] - 2026-02-17
### Added
- **CLI Puitis (`lembaran`)**: Perintah baru `pantau`, `jelajah`, `kuncung` (login), `tanam` (import), `hangus`, `petik`, dan `mulai` (TUI default).
- **Agent Skills**: Integrasi 5 skill inti Vercel di `.agent/skills/`.
- **Instruksi UX**: Penambahan panduan navigasi eksplisit pada TUI (Panah & Enter).
### Changed
- Refactor tipe `Note` untuk mendukung enkripsi kredensial yang lebih fleksibel.
- Migrasi penyimpanan dari `dexie` ke `idb` murni.
### Removed
- Direktori `arsip_legacy/` dan file log/dokumentasi redundant.

... (sisanya tetap sama)

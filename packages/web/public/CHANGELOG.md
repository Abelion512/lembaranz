# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [3.4.0] - 2026-03-28
### Fixed
- **Perbaikan Error Handling**: Menambahkan `cause` pada semua error yang dilempar untuk debugging yang lebih baik (Arsip.ts, Brankas.ts).
- **Perbaikan TypeScript/ESLint**: Menghapus semua warning dari console dan memperbaiki dependency arrays di React hooks.
- **Optimasi Gambar**: Mengganti tag `<img>` dengan komponen `<Image>` dari Next.js untuk optimasi performa.
- **Perbaikan Instalasi CLI**: Mengganti `bun install -g .` dengan `bun link` untuk menangani workspace dependencies dengan benar.
- **Proteksi Timpa .env**: Menambahkan konfirmasi sebelum menimpa file .env yang sudah ada di perintah `env muat`.
### Added
- **Terjemahan Lengkap**: Menambahkan semua kunci terjemahan yang hilang untuk navigasi bantuan (Selasar).
### Changed
- **Dokumentasi Instalasi**: Memperbarui panduan instalasi di semua dokumen (MULAI_CEPAT.md, GETTING_STARTED.md) dengan perintah `bun link`.

## [3.3.0] - 2026-02-22
### Added
- **Restorasi TUI Modern**: Pengembalian antarmuka interaktif berbasis Ink/React yang lebih visual dan intuitif.
- **Unlooping Scroll Logic**: Implementasi `PilihanModern.tsx` kustom untuk mencegah kursor menu berputar balik (loop) di ujung daftar, memberikan kontrol navigasi yang lebih pasti.
- **Subcommand Pengaturan**: Integrasi perintah `lembaran pengaturan` untuk manajemen variabel lingkungan (.env) langsung dari terminal.
### Fixed
- **Emoji & Encoding**: Pembersihan seluruh karakter encoding yang rusak pada antarmuka terminal untuk tampilan yang lebih premium.
- **Scrolling Trap**: Perbaikan logika viewport pada menu utama agar mendukung scrolling ke seluruh item daftar (11+ opsi).


## [3.1.0] - 2026-02-19
### Added
- **Dynamic Documentation Engine**: Seluruh halaman bantuan kini menggunakan `DocRenderer` berbasis Markdown untuk konsistensi.
- **Improved CLI Editor**: Perintah `ukir` sekarang mendukung input multi-baris (multi-line) untuk penulisan aksara yang lebih leluasa.
- **Tanam Otomatis**: Perintah `tanam` di CLI kini mendukung pemindaian dan impor massal file Markdown dari direktori aktif.
- **Dokumentasi Baru**: Menambahkan panduan `Struktur Data`, `Daftar Perintah`, dan `Mulai Berdikari` di pusat bantuan.
### Fixed
- **Path Resolution**: Perbaikan kritis pada `bacaBerkas.ts` untuk memastikan Changelog dan Dokumentasi selalu ditemukan di lingkungan produksi (Vercel Standalone).
- **Asset Sync**: Penambahan mekanisme sinkronisasi otomatis aset root ke folder `public` saat proses build.
### Changed
- **Typography Audit**: Pembaruan gaya visual dokumentasi menjadi "Thin & Spacious" (font-weight 300 & tracking-wide) untuk estetika yang lebih premium.

## [3.0.0] - 2026-02-18
### Added
- **Vim Mode**: Navigasi editor menggunakan shortcut H J K L (Normal/Insert Mode).
- **Otentikasi Biometrik**: Dukungan UI dan simulasi WebAuthn (Touch/FaceID) di layar kunci.
- **Vault Terenkripsi (.lembaran)**: Ekspor cadangan yang dilindungi kunci brankas utama.
- **Fuzzy Search CLI**: Pencarian cerdas pada perintah `jelajah` untuk kecepatan akses.
- **Peta Memori Pro**: Peningkatan visualisasi graph dengan zoom dan interaksi simpul dinamis.

## [2.9.0] - 2026-02-18
### Added
- **Panic Key (Protokol Darurat)**: Penghapusan data instan jika kata sandi darurat dimasukkan.
- **Session Timeout**: Kunci otomatis brankas setelah durasi yang ditentukan untuk keamanan pasif.
- **Sound Design**: Feedback audio halus untuk aksi kritis brankas.
- **Local API Server**: Perintah `lembaran layani` untuk integrasi aplikasi pihak ketiga.

## [2.8.0] - 2026-02-18
### Added
- **Hero Section Dinamis**: Judul dengan efek siklus kata ("Aksara yang Berdikari/Aman/Cerdas").
- **Preview Kustomisasi**: Komponen interaktif untuk simulasi tema warna di landing page.
- **Instalasi GitHub**: Dukungan instalasi CLI langsung via `npm` dan `bun` shorthand.

## [2.7.0] - 2026-02-17
### Added
- **Skrip Instalasi Cerdas**: `install.sh` untuk otomatisasi setup lingkungan di WSL/Linux.
### Changed
- **Branding Audit**: Penyelarasan tipografi headline dan proporsionalitas tombol aksi utama.

## [2.6.0] - 2026-02-17
### Added
- **Virtualisasi Daftar**: Implementasi `react-window` untuk menangani ribuan catatan tanpa lag.
- **Smart Find Search**: Pengindeksan latar belakang untuk pencarian isi catatan terenkripsi.
- **Dokumentasi Publik**: Akses panduan dasar tanpa perlu membuka brankas.
### Fixed
- **GitHub 404**: Koreksi tautan repositori global.

... (sisanya tetap sama)

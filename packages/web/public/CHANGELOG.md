# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [1.0.0] - 2026-03-30

### Added
- **Scope Migration**: Migrasi total ke organisasi `@lembaranz`.
- **Package Reset**: Reset seluruh paket ke rilis stabil `1.0.0`.
- **Textual Lockfile**: Transisi ke `bun.lock` (teks) untuk auditabilitas yang lebih baik.
- **AEO/GEO Optimization**: Optimasi metadata SEO tingkat lanjut dengan JSON-LD dan rich context regional.
- **Unified CLI**: Integrasi penuh perintah `lembaran` untuk ekosistem monorepo.

## [3.4.0] - 2026-03-28

### Added (28 Maret 2026)
- **AI YOLO Mode**: Sistem keamanan single-push untuk Git (auto-disable setelah 1x push)
  - Pre-push hook: `.githooks/pre-push`
  - State tracking: `.git/yolo_mode_state`
  - Helper: `enable-yolo-push.sh` dan `setup-hooks.sh`
  - Dokumentasi: `docs/AI_YOLO_MODE.md`
- **Dependabot Configuration**: Update otomatis untuk npm + github-actions
- **PRD Refactor**: Fokus CLI/TUI, progress 75%, identitas Indonesia
- **README Update**: Identitas Indonesia kuat, tanpa gimmick, fokus developer

### Fixed (28 Maret 2026)
- **TypeScript**: ChildProcess typing di `Env.ts`
- **Linting**: Unused imports di `IkonLayanan.tsx`
- **Web Vault**: Button "Buka Brankas" ditandai CLI-only (deprecated untuk web)
- **Cleanup**: Hapus folder AI agent yang tidak perlu

### Changed
- **Fokus CLI/TUI**: Web vault di-deprecate, fokus ke CLI commands
- **Bahasa**: Semua dokumentasi menggunakan Bahasa Indonesia baku
- **PRD**: Refactor untuk mencerminkan perkembangan terkini

### Removed
- **Web Vault UI**: Fitur vault via web dihapus
- **AI Agent Folders**: `.commandcode`, `.factory`, `.goose`, `.junie`, `.kiro`, `.pochi`, `.qoder`, `.zencoder`

---

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

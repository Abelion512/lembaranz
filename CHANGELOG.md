# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [1.0.2] - 2026-05-11

### Fixed
- **Persistensi File**: Perbaikan race condition dan implementasi penulisan atomik pada `FileAdapter`.
- **Penyatuan Merek**: Mengganti semua penyebutan "Lembaranz" yang tersisa menjadi "Lembaranz" di CLI dan dokumentasi.
- **Sintaks CLI**: Perbaikan kesalahan sintaksis di `TerminalUI` akibat konflik penggabungan.
- **Integrasi Senses**: Menambahkan modul `Senses` dan pengujian unit dari sesi Jules.

## [1.0.1] - 2026-04-13

### Added
- **Desain Ulang Landing Page**: Tata letak bersih dan fokus pada instalasi, terinspirasi oleh OpenCode.ai.
- **Routing Multi-Halaman**: Halaman terpisah untuk `/`, `/why`, `/faq`, dan `/docs`.
- **Berbagai Metode Instalasi**: npm, bun, curl, docker, dan git clone.
- **Toggle Mode Gelap**: Dukungan tema terang, gelap, dan sistem.
- **Control Orb**: Panel pengaturan terpadu (Tema, Bahasa, AI, MCP).
- **Cabang #33**: Semua alur kerja CI/CD diperbarui dari `main` ke `#33`.

### Changed
- **Optimasi UX Mobile**: Perintah instalasi yang dapat diciutkan pada perangkat seluler.
- **Reset Versi**: Semua paket direset ke 1.0.x setelah migrasi scope.
- **Penyederhanaan README**: Bersih, langsung, tanpa gimmick.

### Fixed
- **URL Clone**: Perbaikan `YOUR_USERNAME` → `Abelion512/lembaranz`.
- **npm Ignore**: Folder internal dikecualikan dari publikasi.
- **Kelas Tailwind**: Pembaruan sintaksis yang sudah usang (deprecated).

---

## [1.0.0] - 2026-03-30

### Added
- **Migrasi Scope**: Migrasi total ke organisasi `@lembaranz`.
- **Reset Paket**: Reset seluruh paket ke rilis stabil `1.0.0`.
- **Textual Lockfile**: Transisi ke `bun.lock` (teks) untuk auditabilitas yang lebih baik.
- **AEO/GEO Optimization**: Optimasi metadata SEO tingkat lanjut dengan JSON-LD dan rich context regional.
- **Unified CLI**: Integrasi penuh perintah `lembaranz` untuk ekosistem monorepo.

---

## [3.5.0] - 2026-04-13 *(Pre-Reset)*

> Versi 3.0.0–3.5.0 diterbitkan di bawah nama paket lama `lembaranz` sebelum migrasi scope ke `@lembaranz`.

### Added
- **Gaya GitBook + Apple HIG**: Desain ulang landing page dengan optimasi AEO/GEO.
- **Bagian Ramah Pemula**: Panduan 4 langkah untuk pengguna baru.
- **Data Terstruktur JSON-LD**: Skema SoftwareApplication + FAQPage.

### Changed
- **Klarifikasi GUI vs Web**: Desktop GUI (Tauri) vs Dashboard Web (Docker).
- **Semua Alur Kerja**: Diperbarui dari cabang `main` ke `#33`.

---

## [3.4.0] - 2026-03-28

### Added
- **Mode AI YOLO**: Sistem keamanan satu-dorongan untuk Git (otomatis non-aktif setelah 1 push).
- **Konfigurasi Dependabot**: Pembaruan otomatis untuk npm + github-actions.
- **Refaktor PRD**: Fokus pada CLI/TUI, progres 75%.

### Fixed
- **TypeScript**: Pengetikan ChildProcess di `Env.ts`.
- **Web Vault**: Ditandai sebagai khusus CLI (sudah usang untuk web).

### Removed
- **UI Web Vault**: Fitur web vault dihapus.

---

## [3.3.0] - 2026-02-22

### Added
- **Restorasi TUI Modern**: Membangun kembali antarmuka interaktif dengan Ink/React.
- **Logika Gulir Tanpa Loop**: Navigasi menu kustom tanpa pembungkusan kursor.
- **Sub-perintah Pengaturan**: `lembaranz pengaturan` untuk manajemen .env.

### Fixed
- **Emoji & Encoding**: Pembersihan karakter rusak di UI terminal.
- **Scrolling Trap**: Perbaikan logika viewport untuk pengguliran daftar penuh.

---

## [3.2.0] - 2026-02-20

### Added
- **Mode Vim**: Navigasi H/J/K/L di editor.
- **Otentikasi Biometrik**: Simulasi WebAuthn (Touch/FaceID).
- **Vault Terenkripsi (.lembaranz)**: Ekspor cadangan dengan perlindungan kunci master.
- **Pencarian Fuzzy**: Pencarian cerdas CLI untuk akses cepat.
- **Tombol Panik**: Penghapusan data darurat dengan frasa sandi.
- **Sesi Berakhir**: Penguncian otomatis setelah tidak aktif.

---

## [2.0.0–2.9.0] - 2026-02-17 to 2026-02-18

### Added
- **Bagian Hero Dinamis**: Judul kata yang berganti-ganti.
- **Skrip Instalasi**: `install.sh` untuk penyiapan otomatis.
- **Daftar Virtual**: `react-window` untuk menangani ribuan catatan.
- **Smart Find Search**: Pengindeksan latar belakang konten terenkripsi.
- **Dokumentasi Publik**: Panduan dasar yang dapat diakses tanpa membuka brankas.

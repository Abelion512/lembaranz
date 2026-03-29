# Task: Integrasi Skill, Alias CLI & Pembersihan Redundansi

## Fase 1: Konsolidasi & Skill (Fokus: `.agent`)
- [x] Hapus symlink rusak `skills/` dan folder `.agents`
- [x] Konsolidasi instruksi ke `.agent/skills/`
- [x] Instal ulang 5 skill inti via npx
- [x] Verifikasi aksesibilitas skill

## Fase 2: CLI & Keamanan Puitis (`lembaran`)
- [x] Tambahkan field `bin` ke `package.json`
- [x] Ubah `bin/lembaran` dengan perintah: `pantau`, `jelajah`, `hangus`, `petik`, `kuncung`, `tanam`, `mulai`
- [x] Implementasikan alur `kuncung` (login manual/web)
- [x] Implementasikan pesan edukasi Mantra Pemulihan untuk registrasi
- [x] Tambahkan instruksi UX (Enter/Space) pada `TUI.ts`
- [x] Jalankan `bun link` untuk registrasi global

## Fase 3: Pembersihan Sampah & Audit
- [x] Hapus 18+ file sampah (logs, diffs, saran docs)
- [x] Hapus direktori `arsip_legacy/`
- [x] Hapus library `dexie` dan `argon2-browser` dari `package.json`
- [x] Konsolidasi logika `Arsip.ts` dengan `Penyaring.ts`
- [x] Perbarui referensi port di `AGENTS.md` (3000 -> 1400)
- [x] Verifikasi `bun run build` dan `lint`

## Fase 4: Distribusi & Standalone
- [x] Tambahkan script `build:cli` ke `package.json`
- [x] Kompilasi `lembaran.exe` (Standalone Binary)
- [x] Verifikasi eksekusi binary

## Fase 5: Decoupling Arsitektur (Web/CLI/Native)
- [x] Refactor `Gudang.ts` dengan Adapter Pattern
- [x] Implementasi `BrowserAdapter` (IndexedDB)
- [x] Implementasi `FileAdapter` (JSON/Bun:File untuk CLI)
- [x] Verifikasi CLI `lembaran` berjalan tanpa crash IDB
- [x] Dokumentasi arsitektur modular di `walkthrough.md`

## Fase 6: Dokumentasi & Halaman Informasi
- [x] Buat file root: `LICENSE`, `CONTRIBUTING.md`, `TERMS.md`, `PRIVACY.md`
- [x] Implementasi Halaman `/tentang` (About App + Links)
- [x] Implementasi Halaman `/changelog` (Render MD)
- [x] Implementasi Halaman `/ketentuan` & `/privasi`
- [x] Update `/bantuan` dengan link ke `/tentang`
- [x] Update `llms.txt` untuk visibilitas AI

## Fase 7: Redesign Dokumentasi & UX
- [x] Update Link GitHub ke `Abelion512/lembaran` (Global)
- [x] Redesign `/bantuan`: Fokus "Cara Download CLI" & Step-by-step
- [x] Pindahkan akses `/tentang` ke Halaman Setelan (`/laras`)
- [x] Hapus akses `/tentang` dari `/bantuan` (Diganti Guide CLI)
- [x] Verifikasi alur navigasi baru

# Lembaran - Agent Guidelines

## 🏛️ Struktur Monorepo (Packages)

Proyek ini mengikuti konvensi penamaan 'Indonesia Puitis' dalam struktur monorepo:

- `packages/core/src`: Logika inti, penyimpanan, dan utilitas (Jiwa).
- `packages/cli/src`: Antarmuka terminal (TUI).
- `packages/web/app`: Aplikasi Next.js (GUI & Landing Page).

## 🤖 Aturan Agen

> **Hierarki Pedoman (wajib dibaca berurutan):**
>
> 1. **`.Jules/SPEC.md`** — Pedoman utama: Identitas, aturan operasional, & kapabilitas agent.
> 2. **`.agent/rules/proyek.md`** — Aturan spesifik proyek Lembaran untuk semua agent.
> 3. **`.codex/CONTEXT.md`** — Konteks teknis: Arsitektur, setup, & konvensi kode.

1. **Prioritas Konteks**: Setiap agent **WAJIB** membaca ketiga dokumen di atas (berurutan) sebelum memulai tugas apa pun.
2. **Eksplorasi Luas**: Selalu pindai `packages/core/src` untuk memahami logika enkripsi dan storage sebelum memodifikasi data.
3. **Penyelarasan Nama**: Gunakan terminologi Indonesia untuk logika internal (aksara, brankas, gudang, integritas).
4. **Kewajiban Pembaruan Dokumentasi**: Setiap perubahan kode fungsional **WAJIB** diikuti dengan pembaruan _context_ (`CONTEXT.md` / `AGENTS.md`) dan dokumentasi terkait. Jangan tinggalkan kode baru tanpa penjelasan.

## 🔒 Keamanan & Integritas Data (Sentinel Standard)

1. **Enkripsi Sisi Klien**: AES-GCM 256-bit di `Brankas.ts`.
2. **Key Derivation**: Argon2id dengan salt unik.
3. **Integritas**: SHA-256 untuk deteksi manipulasi data.

## ⚡ Optimasi Performa (Bolt Standard)

1. **Virtualisasi**: Gunakan virtualization (`react-window`) untuk daftar besar.
2. **Session Cache**: Cache hasil dekripsi sementara untuk pencarian cepat.

## 🚀 Perintah Eksekusi

- `bun run dev`: Jalankan Web (port 1400).
- `bun run cli`: Jalankan CLI TUI.
- `bun run test:perf`: Stress-test 1000 catatan.

_Detail teknis kapabilitas Jules tersedia di `.Jules/MCP_CAPABILITIES.md`._

## 📚 Sistem Dokumentasi Dinamis (v3.1.0)

Semua halaman bantuan di `/bantuan` kini menggunakan `DocRenderer.tsx`.

- **Sumber Data**: Berkas `.md` di direktori `docs/` root.
- **Sinkronisasi**: Menjalankan `bun run sinkron-aset` sebelum build akan menyalin dokumen ke `public/docs` untuk akses produksi.
- **Tipografi**: Gunakan font-weight 300 (Thin) dan tracking-wide untuk menjaga estetika premium.

## 🛠️ Peningkatan CLI

- Perintah `ukir` mendukung multi-baris via `prompts`.
- Perintah `tanam` mendukung pemindaian direktori otomatis.

## 🧩 Codex Context (v3.1.0)

Gunakan `.codex/CONTEXT.md` sebagai pedoman teknis utama untuk arsitektur, aturan locale, dan checklist keamanan. Hindari redundansi informasi antara `AGENTS.md` dan `Codex`.

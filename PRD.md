# Product Requirements Document (PRD): Lembaran

### STATUS: FINAL — Siap di-execute (v3.5.0)

> Lembaran: Ekosistem kedaulatan data dan manajemen arsip digital personal.
> Menggabungkan keamanan tingkat tinggi dengan estetika premium "Liquid Glass".
> **Konvensi Nama:** Indonesia Puitis (Jiwa, Raga, Suara, Aksara, Brankas).

---

## 1. Identitas & Filosofi (Visi)

Lembaran bukan sekadar aplikasi catatan, melainkan benteng digital bagi pemiliknya. Dirancang untuk pengembang dan individu yang memprioritaskan kedaulatan data di atas kenyamanan cloud publik.

- **Visi:** Menjadi standar emas untuk penyimpanan rahasia dan catatan personal yang terenkripsi penuh.
- **Prinsip Utama:**
  - **Local-First:** Data Anda, di perangkat Anda.
  - **Privacy-First:** Enkripsi Zero-Knowledge menggunakan **Brankas**.
  - **Estetika Premium:** Antarmuka minimalis, tipografi *Thin & Spacious*.
  - **Kedaulatan Aksara:** Kontrol penuh melalui format terbuka.

- **Target Pengguna:**
  1. **Pengembang:** Butuh manajemen `.env` (Laras) dan CLI (Suara) yang aman.
  2. **Pegiat Privasi:** Menghindari pengawasan cloud.
  3. **Power Users:** Navigasi cepat (Slash Commands, Vim-mode).

---

## 2. Susunan Teknologi (Tech Stack)

### Inti (The Core)
- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun (Backend & CLI)
- **Language:** TypeScript 5.x
- **Kriptografi:** `@noble/ciphers` (AES-GCM 256-bit), `@noble/hashes` (Argon2id, SHA-256)
- **Database Lokal:** IndexedDB (Web) & Local Filesystem (CLI) via `@lembaran/core`

### Antarmuka (The Interface)
- **Web (Raga):** React 19, Tailwind CSS v4 (CSS-first)
- **CLI (Suara):** Ink (React in Terminal), CMD: `lembaran`
- **Animation:** Motion v12
- **Editor:** Tiptap (Markdown based)

---

## 3. Sistem Estetika (Design System)

### "Liquid Glass" Aesthetic
- **Colors (Dark Mode):**
  - BG Utama: `#0a0a0f`
  - Cards/Panels: `rgba(26, 26, 46, 0.6)` + `backdrop-blur(12px)`
  - Accent: `#6C63FF` (Jiwa Purple)
  - Integrity Green: `#00D4AA` (Sentinel Teal)
- **Typography:**
  - Heading: `Syne` (Google Fonts)
  - Body: `Plus Jakarta Sans` (Weight 300/400)
  - Mono: `JetBrains Mono`
- **Motion Specs:**
  - Reveal: Staggered reveal 0.05s
  - Transition: Soft spring transitions, no bounce.

---

## 4. Arsitektur & Fitur Utama

### A. Brankas (Lapisan Keamanan)
- **Jiwa:** Mesin enkripsi AES-GCM 256-bit.
- **Zero-Knowledge:** Kunci derivasi Argon2id di sisi client.
- **Auto-Lock:** Penguncian otomatis setelah 1 menit tidak aktif.
- **Panic Key:** Protokol penghapusan darurat.

### B. Gudang Aksara (Manajemen Catatan)
- **Raga:** Editor modern dengan *Slash Commands* (/).
- **Segel Digital:** Integritas data via HMAC/SHA-256.
- **Organisasi:** Folder, Tagar, dan Peta (Graph View).

### C. Laras & Pundi (Manajemen Konfigurasi)
- **Laras:** Pengelola variabel lingkungan (.env) terenkripsi.
- **Mode Hantu:** Injeksi variabel langsung ke memori tanpa menulis file fisik.
- **Pundi:** Dashboard statistik real-time (jumlah aksara, kapasitas brankas).

---

## 5. Struktur Aplikasi & Halaman

### Raga (Web UI)
- `/` — Landing Page: Estetika Liquid Glass, status Brankas.
- `/masuk` — Dekripsi Brankas: Password prompt (Argon2id).
- `/jelajah` — Gudang Aksara: Sidebar pencarian fuzzy, masonry grid untuk catatan.
- `/ukir` — Editor: Tiptap dengan Vim-mode & Markdown support.
- `/laras` — Environment Manager: Pengelolaan file `.env` antar proyek.
- `/peta` — Visualisasi: Graph view hubungan antar aksara.
- `/bantuan` — Dokumentasi: Rendered dari `docs/*.md`.

### Suara (CLI TUI)
- `lembaran` — Masuk ke TUI interaktif.
- `lembaran ukir` — Buat catatan baru langsung dari terminal.
- `lembaran laras` — Kelola variabel lingkungan proyek.
- `lembaran tanam` — Impor direktori ke dalam brankas.

---

## 6. Urutan Pembangunan (Roadmap)

### Fase 1 — Pondasi (MVP)
- [ ] Setup Monorepo (Core, Web, CLI).
- [ ] Implementasi Brankas (AES-GCM + Argon2id).
- [ ] Editor Dasar (Tiptap + Markdown).
- [ ] Gudang Aksara (Local Storage wrapper).

### Fase 2 — Fitur Utama (Ciri Khas)
- [ ] Laras (.env manager) & Mode Hantu.
- [ ] TUI Interaktif (cli package).
- [ ] Peta Aksara (Graph visualization).
- [ ] Sentinel Auto-Lock.

### Fase 3 — Ekspansi (Community & Sync)
- [ ] Sync Bridge (E2EE sync to personal cloud).
- [ ] Collaboration (Yjs/CRDT).
- [ ] Biometric Unlock (WebAuthn).

---

## 7. Variabel Lingkungan (.env)

| Kunci | Deskripsi | Wajib |
|---|---|---|
| `NODE_ENV` | `development` atau `production` | Ya |
| `NEXT_PUBLIC_APP_URL` | URL Utama aplikasi | Ya |
| `ENCRYPTION_SALT` | Garam default untuk derivasi kunci | Ya |
| `SECRET_SCRUBBER_LEVEL` | Tingkat filter data sensitif di AI | Opsional |

---

## 8. Detail Implementasi V1

### Komponen Brankas (Vault)
- Harus memiliki indikator visual "Terkunci" atau "Terbuka".
- Input password tidak boleh bisa di-copy/paste.
- Progress bar saat derivasi kunci Argon2id (karena intensif CPU).

### Editor Ukir
- Bar navigasi minimalis (Pill-style).
- Floating menu untuk formatting.
- Shortcut `CMD+S` untuk simpan dengan Segel Digital.

---

*PRD Akhir — Lembaran (Abelion Lavv).*
*Status: Locked v3.5.0.*

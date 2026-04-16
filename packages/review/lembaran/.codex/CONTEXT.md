# 🧩 Codex Context - Lembaran

> **Catatan**: Dokumen ini adalah pedoman teknis tingkat 3. Hierarki lengkap: `.Jules/SPEC.md` (Utama) → `.agent/rules/proyek.md` (Proyek) → dokumen ini (Teknis).

Panduan konteks teknis untuk arsitektur, setup lingkungan, aturan locale, dan standar keamanan Lembaran.
_Diperbarui: 28 Maret 2026 — v3.4.0_

## 🏛️ Arsitektur & Terminologi

Proyek ini menggunakan konvensi penamaan **Indonesia Puitis** untuk menjaga kedekatan budaya dan kejelasan fungsional:

- **Aksara**: Data teks atau catatan (Note).
- **Brankas**: Lapisan keamanan/enkripsi (Vault).
- **Gudang**: Lapisan penyimpanan data lokal (Storage/Database).
- **Pundi**: Pengelola state aplikasi (Store).
- **Laras**: Manajemen konfigurasi dan lingkungan (Config/Env).
- **Indera**: Sistem observabilitas dan monitoring.
- **Sentinel**: Sistem keamanan dan audit log.

## 🗂️ Struktur Monorepo

```
lembaran/
├── packages/
│   ├── core/       — @lembaran/core (logika bisnis, enkripsi, storage)
│   ├── web/        — @lembaran/web (Next.js 16, Glass OS aesthetic)
│   └── cli/        — @lembaran/cli (TUI berbasis Ink/React)
├── docs/           — Dokumentasi bilingual (id/ & en/)
├── .agent/         — Aturan & workflow untuk AI agent
├── .Jules/         — Spesifikasi & konteks Jules AI
└── .codex/         — Konteks proyek ini
```

## 🚀 Setup & Pengembangan

```bash
# Instalasi dependensi
bun install

# Daftarkan perintah `lembaran` secara global (Linux/macOS/Windows)
bun link

# Jalankan server pengembangan web (localhost:1400)
bun run dev

# Jalankan CLI TUI interaktif
lembaran
```

> ⚠️ **Catatan Lingkungan**: Dev server menggunakan **Webpack** (bukan Turbopack) karena proyek berjalan di partisi NTFS/exFAT yang tidak mendukung symlink dari Turbopack. Node.js v20+ atau Bun v1.3+ diperlukan.

### Instalasi CLI

Untuk instalasi global yang benar:
```bash
# Dari root monorepo (RECOMMENDED)
bun link

# Atau via script instalasi
curl -fsSL https://lembaran.vercel.app/install.sh | bash
```

> 💡 **Note**: Gunakan `bun link` dari root monorepo untuk menangani workspace dependencies dengan benar. Hindari `bun install -g .` dari subdirektori.

## 🔒 Standar Keamanan (Sentinel)

1. **Zero-Knowledge**: Kata sandi tidak pernah disimpan. Enkripsi dilakukan sepenuhnya di sisi klien.
2. **Kriptografi**:
   - Enkripsi: AES-GCM 256-bit.
   - Derivasi Kunci: Argon2id.
   - Integritas: SHA-256 (Digital Seal).
3. **Panic Key**: Mendukung penghapusan data instan jika menggunakan kunci darurat.
4. **Auto-Lock**: Brankas otomatis terkunci setelah masa tidak aktif atau tab disembunyikan (toleransi 1 menit).

## 🌐 Lokalisasi (Locale)

- **Bahasa Utama**: Bahasa Indonesia (`id`).
- **Bahasa Pendukung**: Inggris (`en`).
- **Penerjemahan Dinamis**: Mendukung AI Linguis untuk menerjemahkan dokumen secara on-the-fly jika versi lokal tidak tersedia.

## 🛠️ Panduan Pengembangan

- **Struktur Monorepo**: `@lembaran/core` adalah otak aplikasi. Perubahan di sini berdampak pada `web` dan `cli`.
- **TUI/CLI**: Menggunakan `Ink` (React di Terminal) dengan estetika minimalis. React 19.2.4 (harus konsisten di semua paket).
- **Web**: Menggunakan Next.js dengan estetika _Glass OS_ (Frosted Glass, Soft Shadows).
- **Bin Global**: Registrasi via `bun link` dari root. Hindari alias manual di shell config.

## 📝 Konvensi Commit

Format: `type(scope): deskripsi singkat`

- `feat(web)`, `feat(cli)`, `feat(core)` — Fitur baru
- `fix(web)`, `fix(cli)`, `fix(core)` — Perbaikan bug
- `docs`, `chore`, `refactor` — Non-fungsional

---

_Dibuat secara otomatis untuk menyelaraskan konteks pengembangan v3.2.0._

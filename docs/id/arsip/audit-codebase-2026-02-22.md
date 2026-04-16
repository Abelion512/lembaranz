# Audit Codebase Lembaranz (22-02-2026)

## Ringkasan
Audit mencakup area core (`Brankas`, `Gudang`, `Arsip`), web (`/bantuan`, i18n, pembacaan berkas), serta konsistensi rute dan dokumentasi.

## Temuan Prioritas Tinggi

### 1) Path Traversal pada loader dokumentasi
- **Lokasi**: `packages/web/lib/ambilKontenDok.ts`
- **Dampak**: `slug` dari URL sebelumnya langsung dipakai untuk membentuk path berkas. Ini membuka kemungkinan traversal (`../`) untuk mencoba membaca berkas non-dokumentasi.
- **Status**: ✅ **DIKERASKAN** (23-02-2026). Sanitasi slug kini tanpa `toLowerCase()` untuk konsistensi case-sensitive, ditambah validasi perubahan ekstrem karakter (anti-evasion), dan mapping eksplisit slug bantuan yang diizinkan (`PETA_SLUG`).

### 2) Potensi XSS pada renderer markdown bantuan
- **Lokasi**: `packages/web/komponen/bersama/PenerjemahAksara.tsx`
- **Dampak**: konten markdown dirender ke HTML lalu diinjeksikan via `dangerouslySetInnerHTML`. Jika markdown mengandung HTML berbahaya atau skema link jahat, skrip dapat dieksekusi.
- **Status**: ✅ **DIKERASKAN** (23-02-2026). Renderer `Marked` kini dikonfigurasi untuk:
    - Memblokir semua raw HTML mentah.
    - Menolak skema link berbahaya (`javascript:`, `data:`, `vbscript:`, `file:`).
    - Menambahkan `rel="noopener noreferrer"` secara otomatis pada link eksternal dengan `target="_blank"`.

## Temuan Prioritas Menengah

### 3) Konflik/duplikasi route bantuan
- **Lokasi**: `packages/web/app/[locale]/bantuan/[slug]/page.tsx`
- **Status**: ✅ **DIBERSIHKAN**. Route duplikat dihapus, implementasi kini tersentralisasi di satu file.

### 4) Risiko penggunaan locale tidak sinkron dengan URL
- **Lokasi**: `AnjunganBantuan.tsx`, `DynamicDocPage`, `PengaturBahasa`.
- **Dampak**: Bahasa UI bisa tidak selaras dengan URL locale.
- **Status**: ✅ **DISINKRONKAN** (23-02-2026). Seluruh komponen bantuan kini menggunakan `useLocale()` dari `next-intl` sebagai source of truth tunggal. Zustand (`usePundi`) tidak lagi menjadi acuan bahasa untuk halaman bantuan.

### 5) Cache dekripsi tanpa batas
- **Lokasi**: `packages/core/src/Brankas.ts`
- **Dampak**: `decryptionCache` dapat tumbuh tak terbatas pada sesi panjang.
- **Status**: ✅ **DIOPTIMASI** (23-02-2026). Ditambahkan batas maksimal 100 item dengan kebijakan pengosongan otomatis (LRU sederhana).

## Temuan Operasional & Keamanan Lainnya

### 6) Namespace LocalStorage
- **Status**: ✅ **DIAMANKAN**. Seluruh penggunaan localStorage kini diproteksi dengan prefix `lembaranz:` untuk mencegah tabrakan data dengan aplikasi lain pada domain yang sama.

### 7) Keamanan Link target="_blank"
- **Status**: ✅ **DIPERBAIKI**. Audit menyeluruh pada komponen web untuk memastikan `rel="noopener noreferrer"` ada pada setiap elemen dengan `target="_blank"`.

## Rekomendasi Lanjutan
1. Pertahankan penggunaan `useLocale` untuk semua fitur i18n mendatang.
2. Gunakan Server Action terpusat untuk pengambilan metadata (`ambilMetadataBantuan`).
3. Selalu jalankan `bun run test:perf` untuk memverifikasi efisiensi cache `Brankas`.

# Audit Codebase Lembaran (22-02-2026)

## Ringkasan
Audit mencakup area core (`Brankas`, `Gudang`, `Arsip`), web (`/bantuan`, i18n, pembacaan berkas), serta konsistensi rute dan dokumentasi.

## Temuan Prioritas Tinggi

### 1) Path Traversal pada loader dokumentasi
- **Lokasi**: `packages/web/lib/ambilKontenDok.ts`
- **Dampak**: `slug` dari URL sebelumnya langsung dipakai untuk membentuk path berkas. Ini membuka kemungkinan traversal (`../`) untuk mencoba membaca berkas non-dokumentasi.
- **Status**: ✅ **Diperbaiki** dengan normalisasi + whitelist karakter slug (`[a-z0-9_-]`).

### 2) Potensi XSS pada renderer markdown bantuan
- **Lokasi**: `packages/web/komponen/bersama/PenerjemahAksara.tsx`
- **Dampak**: konten markdown dirender ke HTML lalu diinjeksikan via `dangerouslySetInnerHTML`. Jika markdown mengandung HTML berbahaya, skrip dapat dieksekusi.
- **Status**: ✅ **Diperbaiki** dengan renderer `Marked` yang menolak raw HTML.

## Temuan Prioritas Menengah

### 3) Konflik/duplikasi route bantuan
- **Lokasi**: `packages/web/app/[locale]/bantuan/[slug]/page.tsx` dan `packages/web/app/[locale]/bantuan/[slug/]/page.tsx`
- **Dampak**: ambigu path & maintenance burden (dua implementasi berbeda untuk halaman sama).
- **Status**: ✅ **Diperbaiki** dengan menghapus route duplikat `[slug/]`.

### 4) Risiko penggunaan locale tidak sinkron dengan URL
- **Lokasi**: beberapa komponen bantuan membaca bahasa dari Zustand (`usePundi`) alih-alih `useLocale`.
- **Dampak**: ketika URL `/en/...` tapi state lokal `id`, konten/meta bisa campur bahasa.
- **Status**: ⚠️ **Belum diperbaiki** dalam patch ini (direkomendasikan migrasi bertahap ke locale berbasis URL sepenuhnya).

### 5) Cache dekripsi tanpa batas
- **Lokasi**: `packages/core/src/Brankas.ts`
- **Dampak**: `decryptionCache` dapat tumbuh tak terbatas pada sesi panjang dan dataset besar.
- **Status**: ⚠️ **Belum diperbaiki** (disarankan LRU + limit ukuran).

## Temuan Operasional

### 6) Verifikasi quality gate tidak bisa dijalankan penuh di environment ini
- `bun run lint` gagal karena dependency ESLint tidak tersedia lokal.
- `bun install` gagal dengan banyak `403` dari registry.

## Rekomendasi Lanjutan
1. Migrasi seluruh komponen web i18n ke `next-intl` locale URL (`useLocale`) dan hindari state bahasa ganda.
2. Tambahkan sanitasi defense-in-depth (mis. DOMPurify pada sisi klien/server) bila suatu saat raw HTML perlu didukung.
3. Implementasi LRU cache dekripsi pada `Brankas` untuk menjaga memori.
4. Tambahkan test unit keamanan untuk slug sanitization + markdown sanitization.

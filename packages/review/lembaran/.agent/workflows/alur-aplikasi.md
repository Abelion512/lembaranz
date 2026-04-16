---
description: Alur utama pengguna (Login, Navigasi, dan Pembuatan Catatan)
---

# Alur Aplikasi Lembaran (App Flow)

Dokumentasi ini menjelaskan langkah-langkah verifikasi fungsionalitas utama aplikasi Lembaran melalui antarmuka web.

## Langkah-langkah Verifikasi

1. **Akses Aplikasi**: Buka `http://localhost:1400`.
2. **Inisialisasi / Buka Brankas**:
   - Jika brankas belum ada: Masukkan sandi baru (misal: `password123`) dan buat brankas.
   - Jika sudah ada: Masukkan sandi yang sudah ditetapkan.
3. **Penjelajahan**: Verifikasi bahwa daftar catatan (Arsip) muncul di halaman utama.
4. **Pembuatan Catatan**:
   - Klik tombol "Ukir Catatan Baru" atau ikon tambah.
   - Masukkan Judul: `Tes Integrasi Browser`.
   - Masukkan Konten: `Ini adalah catatan otomatis dari verifikasi alur aplikasi.`.
   - Simpan catatan.
5. **Verifikasi Pencarian**: Cari judul catatan yang baru dibuat di bilah pencarian.

// turbo 3. Jalankan verifikasi di browser otomatis.

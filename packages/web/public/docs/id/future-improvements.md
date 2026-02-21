# Rencana Peningkatan Masa Depan (Lembaran)

Dokumen ini berisi saran teknis dan fungsional untuk meningkatkan Lembaran menjadi platform manajemen data tingkat tinggi.

## 🔒 Keamanan & Enkripsi
1.  **Integrasi WebAuthn (Biometrik)**: Mendukung pembukaan brankas via sidik jari (TouchID) atau pengenalan wajah (FaceID/Windows Hello) menggunakan standar WebAuthn.
2.  **Encrypted ZIP/Age Export**: Mengganti ekspor ZIP biasa dengan ZIP terenkripsi atau format `.age` untuk menjamin keamanan arsip saat dipindahkan antar perangkat.
3.  **Audit Log Integritas**: Sistem pencatatan otomatis jika terjadi percobaan akses gagal atau deteksi segel digital (`_hash`) yang rusak pada catatan tertentu.

## 💻 Terminal (CLI & TUI)
4.  **TUI Fuzzy Search**: Implementasi pencarian catatan berbasis teks secara langsung di dalam TUI menggunakan algoritma fuzzy matching.
5.  **TUI Markdown Editor**: Penambahan editor markdown minimalis (seperti `nano` atau `vim` internal) di dalam TUI agar manajemen catatan bisa dilakukan 100% tanpa browser.
6.  **Scripting Engine**: Izinkan developer menulis script (dalam JS/TS) untuk memproses catatan secara masal lewat CLI (misal: "Hapus semua catatan yang mengandung kata 'test'").

## 🔄 Sinkronisasi & Portabilitas
7.  **CRDT-based Sync (Yjs)**: Implementasi sinkronisasi tanpa konflik menggunakan library Yjs untuk memastikan data konsisten saat dibuka di banyak perangkat secara bersamaan.
8.  **Cloud Bridge (Google Drive/Dropbox)**: Opsi sinkronisasi ke penyimpanan cloud milik user sendiri sebagai alternatif Supabase, memberikan kedaulatan data penuh.
9.  **Import Tooling**: Alat otomatis untuk mengimpor data dari aplikasi lain seperti Obsidian, Notion, atau Apple Notes.

## ✨ Pengalaman Pengguna (UX)
10. **Vim-Mode Editor**: Tambahkan plugin navigasi gaya Vim pada editor web Tiptap untuk meningkatkan produktivitas developer.
11. **Attachment Encrypted Storage**: Kemampuan untuk menyimpan gambar atau dokumen (PDF) yang dienkripsi langsung ke dalam IndexedDB.
12. **Sharing Link Self-Destruct**: Fitur untuk membagikan satu catatan melalui link publik yang terenkripsi dan otomatis terhapus setelah dibuka sekali.

---
*Daftar ini dirancang untuk mempertahankan filosofi 'Developer Vibes' dan 'Privacy-First'.*

# Rencana Peningkatan Masa Depan (Lembaran)

Dokumen ini berisi saran teknis dan fungsional untuk meningkatkan Lembaran menjadi platform manajemen data tingkat tinggi.

## 🔒 Keamanan & Enkripsi
1.  **Integrasi WebAuthn (Biometrik)**: [PROGRES] Implementasi dasar registrasi credential sedang dikembangkan. Simulasi bypass telah dihapus untuk keamanan.
2.  **Encrypted ZIP/Age Export**: Mengganti ekspor ZIP biasa dengan ZIP terenkripsi atau format `.age`.
3.  **Audit Log Integritas**: Sistem pencatatan otomatis jika terjadi percobaan akses gagal atau deteksi segel digital (`_hash`) yang rusak.
4.  **Real Paper Key Recovery**: ✅ **SELESAI** (v3.1.0). Pemulihan akses via mnemonic 12 kata kini fungsional dan terhubung ke key derivation.
5.  **Password Reset Flow**: ✅ **SELESAI** (v3.1.0). Alur penetapan kata sandi baru secara paksa setelah pemulihan berhasil.

## 💻 Terminal (CLI & TUI)
6.  **TUI Fuzzy Search**: Implementasi pencarian catatan berbasis teks secara langsung di dalam TUI.
7.  **TUI Markdown Editor**: ✅ **SELESAI** (v3.0.0). Penambahan editor markdown minimalis di dalam TUI (`ukir`).
8.  **Scripting Engine**: Izinkan developer menulis script (dalam JS/TS) untuk memproses catatan secara masal lewat CLI.

## 🔄 Sinkronisasi & Portabilitas
9.  **CRDT-based Sync (Yjs)**: Implementasi sinkronisasi tanpa konflik menggunakan library Yjs.
10. **Cloud Bridge (Google Drive/Dropbox)**: Opsi sinkronisasi ke penyimpanan cloud milik user sendiri.
11. **Import Tooling**: ✅ **SELESAI** (v3.0.0). Perintah `tanam` untuk impor massal markdown.

## ✨ Pengalaman Pengguna (UX)
12. **Vim-Mode Editor**: ✅ **SELESAI** (v3.0.0). Dukungan navigasi gaya Vim (h, j, k, l, etc.) pada editor web.
13. **Attachment Encrypted Storage**: Kemampuan untuk menyimpan gambar atau dokumen (PDF) yang dienkripsi.
14. **Sharing Link Self-Destruct**: Fitur untuk membagikan satu catatan melalui link publik yang terenkripsi.

---
*Daftar ini dirancang untuk mempertahankan filosofi 'Developer Vibes' dan 'Privacy-First'.*

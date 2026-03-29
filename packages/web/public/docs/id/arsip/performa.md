
Lembaran dirancang untuk kecepatan ekstrem. Kami percaya bahwa keamanan tidak boleh mengorbankan pengalaman pengguna. Berikut adalah bagaimana kami menangani ribuan catatan dengan instan.

## 1. Virtualisasi Daftar (Snappy UI)

Kami menggunakan teknik **List Virtualization** untuk merender ribuan catatan dalam daftar arsip. Hanya elemen yang terlihat di layar yang benar-benar dirender ke DOM.

- **Efisiensi Memori**: Mengurangi beban RAM pada browser.
- **FPS Tinggi**: Scroll tetap mulus pada 60fps meskipun Anda memiliki 10.000+ catatan.
- **Implementasi**: Menggunakan `react-window` dengan konfigurasi *fixed row height* untuk performa maksimal.

## 2. Session-Level Decryption Cache

Meskipun setiap catatan dienkripsi secara individual (AES-GCM), mendekripsi ratusan catatan sekaligus untuk pencarian bisa memakan waktu CPU.

- **Cache Sementara**: Kami menyimpan hasil dekripsi di dalam memori (RAM) hanya selama sesi aktif.
- **Pencarian Instan**: Fitur *Smart Find* mencari langsung di cache memori, bukan melakukan operasi kriptografi berulang kali pada database.
- **Kemanan**: Cache ini dihapus sepenuhnya saat brankas dikunci atau halaman di-*refresh*.

## 3. Background Indexing

Saat Anda membuka brankas, Lembaran melakukan pengindeksan di latar belakang.

- **Non-blocking**: Pengindeksan tidak membekukan antarmuka (UI).
- **Chunked Processing**: Data diproses dalam potongan-potongan kecil agar browser tetap responsif.

## 4. On-Device AI (Pujangga)

Logika AI (ringkasan, saran tag) berjalan sepenuhnya di perangkat Anda menggunakan WebLLM.

- **Tanpa Latensi Jaringan**: Tidak ada waktu tunggu kirim-terima data ke server.
- **Privasi Total**: Data Anda tidak pernah dikirim ke server AI pihak ketiga.

# Konteks Pengembangan & Log Perubahan (Lembaran v2.0.7)

Dokumen ini mendetailkan perubahan besar yang dilakukan selama fase migrasi dan optimasi untuk mencapai harmoni antara fitur modern dan estetika *Glass OS* asli.

## 1. Restorasi Estetika Legacy (Pixel-Perfect)

**Masalah**: Versi migrasi awal kehilangan "jiwa" desain asli; blur terlalu kuat, radius terlalu bulat, dan layout terasa terlalu "Tailwind standar".

**Solusi**:
- **Sinkronisasi CSS**: Variabel di `src/app/globals.css` diselaraskan 100% dengan `arsip_legacy/pustaka/gaya/gayanya.css`. 
- **Typography**: Mengunci penggunaan font `SF Pro` dengan fallback yang tepat untuk menjaga nuansa iOS.
- **Efek Glassmorphism**: Mengembalikan nilai `--glass-blur: 25px` danopacity frosted glass agar konten di belakang tetap terbaca namun artistik.

## 2. Perubahan Arsitektur State Management

**Masalah**: Struktur lama menggunakan `toko.ts` yang mulai membengkak dan kurang terstruktur untuk fitur-fitur baru seperti mood tracking dan enkripsi tingkat tinggi.

**Solusi**:
- **Migrasi ke Pundi.ts**: Memperkenalkan `@/aksara/Pundi` sebagai sumber kebenaran (Source of Truth) baru berbasis Zustand.
- **Pemisahan Logic & View**: Memindahkan rendering utama dari `src/app/page.tsx` ke `src/app/LembaranUtama.tsx` untuk mendukung `Suspense` dan pemuatan asinkron yang lebih baik.
- **Cleanup**: Menghapus file `toko.ts` dan referensi lama untuk menghindari konflik sirkular.

## 3. Peningkatan Keamanan & Integritas Data

**Masalah**: Data disimpan secara lokal tanpa validasi integritas, rentan terhadap manipulasi eksternal atau kerusakan file.

**Solusi**:
- **Segel Digital (HMAC-like Hashing)**: Setiap catatan sekarang disimpan dengan properti `_hash` yang dihitung menggunakan SHA-256. Aplikasi akan memberikan peringatan jika data diubah di luar aplikasi.
- **Argon2id Integration**: Mengganti KDF standar dengan Argon2id untuk derivasi kunci enkripsi, memberikan perlindungan maksimal terhadap serangan *brute-force* pada level sistem (WebAssembly).

## 4. Redesign Navigasi & UX (Apple Style)

**Masalah**: Tombol "Tambah" di navigasi bawah terasa datar dan kurang intuitif.

**Solusi**:
- **Floating Action Button (FAB)**: Mendesain ulang tombol "+" dengan posisi terangkat (`-top-6`) dan bayangan yang lebih dalam.
- **Semantic Routing**: Mengubah rute teknis menjadi lebih puitis:
  - `/setelan` → `/laras`
  - `/biodata` → `/jatidiri`
  - `/changelog` → `/versi`

## 5. Pembersihan & Optimasi Build

**Masalah**: Terdapat banyak file redundan (`NavigasiBawah.tsx` vs `KemudiBawah.tsx`) dan struktur folder ganda yang membingungkan *Turbopack*.

**Solusi**:
- **Hard Cleanup**: Menghapus total komponen dan direktori lama yang sudah tidak digunakan.
- **Scroll Optimization**: Memperbaiki bug scroll yang macet di beberapa device dengan memaksa `overflow-y: auto` pada level root.
- **Linting Rigorous**: Menghilangkan semua `any` yang tidak perlu dan memastikan semua `<img>` menggunakan `next/image` untuk optimasi LCP.

---

> [!IMPORTANT]
> Seluruh perubahan ini telah diverifikasi melalui `bun run build` dengan status **Sukses (Exit Code 0)**.

## 6. Ekspansi Antarmuka & Dokumentasi (v2.3.0)

**Masalah**: Pengguna developer membutuhkan akses yang lebih cepat daripada sekadar antarmuka web, serta panduan teknis yang mudah diakses dan digunakan.

**Solusi**:
- **Manajemen Terminal (CLI/TUI)**: Membangun binary `lembaran` berbasis Bun yang mendukung perintah langsung (`list`, `status`, `hapus`) dan antarmuka visual terminal (TUI) interaktif.
- **Integrated Help System**: Menambahkan halaman `/bantuan` (Dokumentasi) yang dirancang khusus untuk developer dengan fitur salin kode satu-klik.
- **Roadmap Skalabilitas**: Menyusun rencana masa depan di `docs/FUTURE_IMPROVEMENTS.md` untuk mengarahkan proyek menuju standar *Enterprise*.

---
> [!NOTE]
> Proyek ini sekarang diposisikan sebagai alat bantu utama developer untuk pengelolaan kredensial secara aman dan efisien.

## 7. Optimasi Performa & UX (v2.6.0 - Misi Bolt ⚡)

**Masalah**: Rendering daftar catatan yang besar (>1000) mulai memperlambat browser, dan pencarian di dalam isi catatan (enkripsi) terlalu lambat karena harus didekripsi satu per satu.

**Solusi**:
- **Virtualisasi Daftar (List Virtualization)**: Menggunakan `react-window` untuk merender ribuan catatan dengan lancar tanpa membebani memori DOM.
- **Smart Find (Background Indexing)**: Memperkenalkan mekanisme pengindeksan latar belakang yang mendekripsi konten catatan ke dalam *session cache* memori. Hal ini memungkinkan pencarian instan di seluruh isi catatan tanpa mengorbankan keamanan jangka panjang.
- **Akses Dokumentasi Publik**: Memisahkan dokumentasi teknis ke rute `/bantuan/publik` agar calon pengguna dapat mempelajari sistem sebelum melakukan inisialisasi brankas.
- **Koreksi Tautan Kritis**: Memperbaiki tautan GitHub yang rusak (404) di seluruh aplikasi.

---
> [!NOTE]
> Fokus versi ini adalah "Speed is a Feature". Aplikasi kini siap menangani ribuan catatan dengan performa instan.

## 8. Standarisasi Instalasi & Polish UI (v2.7.0)

**Masalah**: Alur instalasi CLI tidak ramah bagi pengguna WSL/Linux yang belum memiliki `bun`, dan landing page memiliki masalah keterbacaan pada headline serta ukuran tombol yang kurang proporsional.

**Solusi**:
- **Universal Installer (`install.sh`)**: Menciptakan skrip instalasi satu baris yang cerdas; mampu mendeteksi dan menginstal `bun` secara otomatis sebelum menarik repositori Lembaran dan mendaftarkan perintah `lembaran` secara global.
- **Refinement Tipografi**: Menurunkan skala headline dari `8xl` ke `6xl` dan melonggarkan *letter-spacing* untuk meningkatkan kenyamanan baca sesuai feedback pengguna.
- **Proporsionalitas Tombol**: Mengecilkan ukuran tombol aksi utama agar lebih elegan dan tidak mendominasi layar secara berlebihan.
- **Transparansi Fitur**: Memberikan label "Coming Soon" yang jelas pada widget instalasi untuk metode yang sedang dalam pengembangan (NPM, Brew, dll).

---
> [!NOTE]
> Versi ini menandai kesiapan Lembaran untuk digunakan secara luas oleh komunitas developer melalui alur instalasi yang jauh lebih reliabel.

## 9. Hero Redesign & Customization Preview (v2.8.0)

**Masalah**: Visual landing page masih terasa kaku, deskripsi terlalu mendominasi, dan potensi kustomisasi aplikasi tidak terlihat oleh pengunjung pertama.

**Solusi**:
- **Dynamic Hero Title**: Mengimplementasikan efek *cycling words* pada judul utama untuk memberikan kesan modern dan dinamis ("Aksara yang > Berdikari/Aman/Cerdas").
- **Description Scaling**: Mengecilkan skala font deskripsi hero dan membatasi lebar maksimalnya untuk meningkatkan hierarki visual.
- **Interactive Customization**: Menambahkan modul preview kustomisasi yang memungkinkan user bereksperimen dengan aksen warna utama (Blue, Emerald, Amber, Rose, Purple) langsung di landing page.
- **GitHub CLI Install**: Mengaktifkan perintah `npm` dan `bun` menggunakan *shorthand* GitHub agar user dapat menginstal CLI secara instan meskipun belum terbit di registri resmi.

---
> [!NOTE]
> Versi 2.8.0 mengalihkan fokus dari sekadar fungsionalitas menuju pengalaman visual yang premium dan personal.

## 10. Protokol Keamanan & Utilitas Menyeluruh (v2.9.0)

**Masalah**: Meskipun visual sudah premium, fitur keamanan inti seperti Panic Key dan Session Timeout masih berupa rencana, serta kurangnya alat pemeliharaan data bagi pengguna.

**Solusi**:
- **Protokol Panic Key**: Mengimplementasikan logika penghapusan data instan (nuke) jika user memasukkan kata sandi darurat yang telah diatur. Ini melindungi user dari paksaan akses data.
- **Auto-Lock Session**: Menambahkan pengaturan durasi sesi yang secara otomatis mengunci brankas dan membersihkan kunci aktif dari memori setelah waktu tertentu.
- **Audio Haptics**: Menggunakan Web Audio API untuk memberikan feedback suara puitis saat interaksi kritis, meningkatkan "feel" aplikasi.
- **Developer Maintenance Tools**: Menambahkan statistik penggunaan IndexedDB dan alat pemindai tautan mati (dead link) untuk menjaga kualitas arsip kredensial.
- **Local API Infrastructure**: Memulai pondasi server API lokal di CLI untuk integrasi masa depan dengan VS Code dan launcher sistem.

---
> [!NOTE]
> Versi 2.9.0 adalah lompatan besar dalam hal fungsionalitas keamanan 'Sentinel' dan kesiapan ekosistem Lembaran.

## 11. Lompatan Besar: Ekosistem Berdikari v3 (v3.0.0)

**Masalah**: Lembaran membutuhkan fitur produktivitas tingkat lanjut agar benar-benar menjadi pilihan utama developer dan pengguna "Power User".

**Solusi**:
- **Produktivitas Tanpa Batas (Vim Mode)**: Mengintegrasikan logic navigasi Vim ke dalam editor Tiptap, memungkinkan pengeditan cepat tanpa menyentuh mouse.
- **Biometrik Modern**: Menyiapkan infrastruktur WebAuthn untuk otentikasi biometrik yang aman dan modern di browser.
- **Portabilitas Berbasis Privasi**: Mengganti ekspor JSON biasa dengan format `.lembaran` yang terenkripsi penuh, menjamin data tetap aman bahkan saat berada di penyimpanan eksternal.
- **Alur Kerja Terminal (CLI 2.0)**: Menambahkan perintah `ukir` untuk pengeditan cepat dan fuzzy search pada `jelajah` untuk mempermudah navigasi arsip ribuan catatan via terminal.
- **Visualisasi Pikiran (Graph View 2.0)**: Redesain total Peta Memori dengan interaksi dinamis dan estetika yang lebih tajam.

---
> [!IMPORTANT]
> Versi 3.0.0 adalah pencapaian tertinggi dalam visi Lembaran sebagai "Aksara yang Berdikari".

## 12. Penguatan Infrastruktur & Dokumentasi Dinamis (v3.1.0)

**Masalah**: Kesalahan resolusi path pada file statis (Changelog & Docs) sering terjadi di lingkungan produksi (Vercel Standalone), dan sistem bantuan masih bersifat statis (hardcoded) yang menyulitkan pemeliharaan.

**Solusi**:
- **Robust Path Resolver**: Mengimplementasikan `bacaBerkas.ts` dengan sistem fallback berlapis untuk memastikan file selalu ditemukan di Local, Docker, maupun Vercel.
- **Dynamic Doc Engine**: Mengubah seluruh halaman bantuan menjadi dinamis menggunakan `DocRenderer` yang memparsing Markdown secara real-time.
- **CLI Editor Upgrade**: Meningkatkan perintah `ukir` untuk mendukung input multi-baris dan `tanam` untuk impor massal file .md.
- **Refinement Tipografi**: Menerapkan estetika *Thin & Spacious* (font-weight 300) pada seluruh elemen dokumentasi untuk kesan yang lebih premium.

---
> [!NOTE]
> **Mengapa Lompat ke Versi 3?**
> Versi 3 menandai era **Ekosistem Berdikari**. Perubahan dari v2 ke v3 bukan sekadar update fitur, melainkan perombakan total arsitektur menjadi **Monorepo** yang menyatukan Core logic, CLI TUI, dan Web GUI. Versi ini juga memperkenalkan fitur "Sentinel" tingkat tinggi seperti Argon2id, Vim Mode, dan infrastruktur Biometrik yang menjadikannya standar baru bagi aplikasi kedaulatan data.

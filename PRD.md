# Product Requirements Document (PRD): Lembaran

**Versi:** 3.3.0
**Status:** Dokumentasi Sistem Menyeluruh
**Pemilik Produk:** Abelion Lavv
**Bahasa:** Bahasa Indonesia (Terminologi Puitis)

---

## 1. Visi & Filosofi
Lembaran adalah platform manajemen arsip digital personal yang berfokus pada kedaulatan data dan pengalaman pengguna premium. Proyek ini menggabungkan keamanan tingkat militer dengan estetika yang terinspirasi dari iOS, dirancang khusus untuk pengembang dan individu yang memprioritaskan privasi.

### Prinsip Utama:
*   **Local-First:** Data disimpan secara lokal di perangkat pengguna sebagai sumber kebenaran utama (*source of truth*).
*   **Privacy-First:** Enkripsi *End-to-End* (E2EE) wajib untuk semua data sensitif menggunakan mesin **Brankas**.
*   **Estetika Premium:** Antarmuka *Liquid Glass* yang minimalis, menggunakan tipografi *Thin & Spacious* (font-weight 300).
*   **Kedaulatan Aksara:** Memberikan kendali penuh kepada pengguna atas data mereka melalui format terbuka dan alat manajemen mandiri.

---

## 2. Target Pengguna
1.  **Pengembang Perangkat Lunak:** Membutuhkan tempat aman untuk menyimpan kredensial, catatan teknis, dan bekerja melalui terminal (CLI/TUI).
2.  **Pegiat Privasi:** Individu yang menghindari solusi *cloud* publik dan menginginkan enkripsi transparan yang bisa diaudit.
3.  **Power Users:** Pengguna yang menyukai sistem navigasi cepat (Vim-mode, Slash Commands) dan visualisasi data yang cerdas.

---

## 3. Fitur Utama (The Core Features)

### A. Brankas (Sistem Keamanan & Enkripsi)
*   **Enkripsi AES-GCM 256-bit:** Melindungi seluruh konten catatan, judul, dan metadata folder.
*   **Derivasi Kunci Argon2id:** Mengubah kata sandi pengguna menjadi kunci enkripsi yang kuat secara lokal (WebAssembly).
*   **Zero-Knowledge Architecture:** Kata sandi dan kunci tidak pernah disimpan di disk atau dikirim ke jaringan.
*   **Auto-Lock:** Brankas akan mengunci secara otomatis setelah periode tidak aktif atau saat aplikasi ditutup.
*   **Panic Key:** Protokol penghapusan data instan jika terjadi situasi darurat.

### B. Gudang Aksara (Manajemen Catatan)
*   **Editor Tiptap Modern:** Mendukung Markdown, Vim-mode, dan *Slash Commands* (/).
*   **Segel Digital (Integritas):** Validasi HMAC/SHA-256 untuk memastikan data tidak dimanipulasi oleh pihak luar.
*   **Organisasi Dinamis:** Folder, penyematan (*pinning*), dan tagar untuk pengelompokan informasi.
*   **Ekspor Berdikari:** Mendukung format `.lembaran` (terenkripsi) dan Markdown standar.

### C. Sentinel & Pujangga (Kecerdasan Otonom)
*   **Sentinel Sovereign:** Agen latar belakang yang memantau integritas sistem dan melakukan pemulihan mandiri (*self-healing*).
*   **Pujangga Engine:** Manajer penyedia AI (Gemini/Lokal) yang membantu penyusunan konten tanpa membocorkan rahasia melalui *Secret Scrubber*.
*   **Laporan Privasi:** Audit transparan terhadap setiap aksi yang dilakukan oleh agen AI.

### D. Jelajah & Peta (Navigasi & Visualisasi)
*   **Peta Catatan:** Visualisasi hubungan antar catatan menggunakan graf dinamis.
*   **Pencarian Cepat:** *Fuzzy search* instan bahkan pada ribuan catatan melalui *Session Cache*.

### E. Antarmuka Terminal (CLI/TUI)
*   **Binary `lembaran`:** Perintah langsung untuk mengelola arsip (`ukir`, `jelajah`, `tanam`).
*   **TUI Interaktif:** Antarmuka visual terminal yang puitis untuk manajemen data tanpa meninggalkan lingkungan pengembangan.

---

## 4. Spesifikasi Teknis
*   **Framework:** Next.js 16 (App Router), React 19.
*   **Runtime:** Bun (Backend & CLI).
*   **Penyimpanan Utama:** IndexedDB (Browser), Local Filesystem (CLI).
*   **Styling:** Tailwind CSS 4 dengan kustomisasi *Glassmorphism*.
*   **Kriptografi:** `@noble/ciphers` (AES-GCM), `@noble/hashes` (SHA-256, Argon2id).
*   **Monorepo Struktur:**
    - `packages/core`: Logika bisnis & keamanan (Jiwa).
    - `packages/web`: Antarmuka grafis (Raga).
    - `packages/cli`: Antarmuka terminal (Suara).

---

## 5. Pengalaman Pengguna (UX)
*   **Navigasi Pill-Style:** Kemudi bawah yang minimalis untuk akses cepat.
*   **Tipografi:** Fokus pada keterbacaan tinggi dengan nuansa "Developer Vibes".
*   **Haptic & Audio:** Feedback suara puitis untuk aksi-aksi kritis (v2.9.0+).
*   **Bantuan Dinamis:** Sistem dokumentasi terintegrasi di `/bantuan` yang mengambil data langsung dari berkas Markdown.

---

## 6. Roadmap & Masa Depan
1.  **Biometrik Penuh:** Integrasi WebAuthn untuk pembukaan brankas via sidik jari/wajah.
2.  **Sync Bridge:** Sinkronisasi terenkripsi ke penyimpanan *cloud* pribadi (Google Drive/Dropbox).
3.  **Encrypted Attachments:** Dukungan penyimpanan gambar dan PDF yang terenkripsi penuh.
4.  **Collaboration (CRDT):** Berbagi catatan terenkripsi dengan protokol Yjs untuk kolaborasi tanpa konflik.

---

## 7. Kesimpulan
Lembaran bukan sekadar aplikasi catatan, melainkan ekosistem kedaulatan data. Dengan menggabungkan teknologi modern dan filosofi privasi yang teguh, Lembaran memberikan ketenangan pikiran bagi pemiliknya dalam mengelola aksara-aksara berharga mereka.

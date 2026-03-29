# Spesifikasi Teknis Lembaran (Source of Truth)

Dokumen ini mendefinisikan standar baku untuk pembangunan ulang aplikasi Lembaran agar tetap kokoh, konsisten, dan aman.

## 1. Filosofi & Visi
*   **Local-First**: Data disimpan di perangkat pengguna sebagai sumber kebenaran utama.
*   **Privacy-First**: Enkripsi *End-to-End* (E2EE) wajib untuk semua data sensitif.
*   **Premium Aesthetics**: Antarmuka berbasis *Liquid Glass* (Glassmorphism) yang terinspirasi dari iOS.
*   **Modularitas**: Kode harus dinamis, menghindari variabel statis (*hardcoded*), dan siap untuk skalaritas besar.

## 2. Sistem Keamanan (The Brankas Engine)
Implementasi keamanan harus mengikuti standar kode legacy:
*   **Derivasi Kunci**: Menggunakan `PBKDF2` dengan `HMAC-SHA256`, iterasi 600.000, dan salt unik per pengguna.
*   **Algoritma Enkripsi**: `AES-GCM` 256-bit.
*   **Manajemen Kunci**: Kunci enkripsi hanya ada di memori (RAM) dan tidak boleh disimpan di `localStorage` atau `IndexedDB`.
*   **Auto-Lock**: Memori kunci dihapus saat aplikasi dikunci atau sesi berakhir.
*   **Cakupan Data**: Data yang WAJIB dienkripsi:
    - Konten Catatan & Judul
    - Daftar Folder
    - Profil (Nama, Bio, Avatar)
    - Konfigurasi Sync (API Keys)

## 3. Manajemen Data (The Basisdata Engine)
Sistem penyimpanan harus mendukung skalabilitas:
*   **Primary Store**: `IndexedDB` (Menggunakan pustaka `idb` untuk kemudahan).
*   **Object Stores**:
    - `notes`: Koleksi catatan (id, content, folderId, pinned, updatedAt).
    - `folders`: Struktur metadata folder.
    - `trash`: Tempat sampah sementara dengan retensi 30 hari.
    - `kv`: Key-Value store untuk konfigurasi aplikasi.
    - `meta`: Metadata sistem (Vering, Encryption Salt).
*   **Sync Logic**: Sinkronisasi dengan Supabase dilakukan secara delta (hanya data yang berubah) untuk efisiensi jaringan.

## 4. Desain & Antarmuka (The Corak System - Stitch Standard)
Standar visual yang harus dipatuhi berdasarkan referensi **Google Stitch**:
*   **Warna Utama**:
    - Primary: `#135bec` (iOS Blue).
    - Background Light: `#f6f6f8`.
    - Background Dark: `#101622`.
*   **Glassmorphism (Glass Card)**:
    - Light: `rgba(255, 255, 255, 0.75)` dengan `backdrop-filter: blur(12px)`.
    - Dark: `rgba(16, 22, 34, 0.6)` dengan `border: 1px solid rgba(255, 255, 255, 0.05)`.
    - Border: `1px solid rgba(255, 255, 255, 0.5)` (Light).
*   **Prinsip Interaksi & Animasi**:
    - **No Hover**: Tidak ada perubahan visual saat kursor melintas (untuk rasa touch-native).
    - **Opacity Feedback**: Gunakan perubahan opasitas pada `active` state (saat ditekan).
    - **No Scale/Bounce**: Hindari animasi perbesaran atau pantulan yang berlebihan.
*   **Layout**: 
    - **Grouped List**: Mengikuti gaya iOS Settings dengan `border-radius: 1rem (16px)`.
    - **Bottom Navigation**: Navigasi utama berada di bawah (Pill Style).
*   **Iconografi**: Menggunakan `SF Symbols` kustom (atau `Lucide` dengan stroke tipis 1.5px).
*   **Tipografi**: Menggunakan font `Inter` atau `Geist` dengan berat `Medium` dan `Regular` saja.

## 5. Logika Bisnis & Gamifikasi (The Aksara Logic)
*   **Versioning**: Format `YYYYMMDD-vX` dengan *codename* puitis (Bahasa Indonesia).
*   **XP System**:
    - Memberikan XP untuk aktivitas positif (Menulis, Tracking Mood, Backup).
    - Tier: Penyusun -> Arsiparis -> Konservator -> Kurator -> Maestro.
*   **Editor**:
    - Mendukung Markdown dasar.
    - Fitur "Slash Command" (/) untuk akses cepat elemen formatting.
    - Auto-save draft setiap 15 detik atau saat perpindahan fokus.

## 6. Standar Sintaks & Struktur Kode
*   **Bahasa**: TypeScript (Wajib) untuk menjamin tipe data yang konsisten.
*   **Pola**: Feature-Sliced Design (FSD).
    - `lib/storage`: Seluruh logika `brankas` dan `basisdata`.
    - `components/ui`: Komponen atomik (Buttons, Inputs).
    - `components/shared`: Komponen shell (Landing, BottomNav).
*   **Naming Convention**:
    - Fungsi/Variabel: `camelCase`.
    - Komponen/Kelas: `PascalCase`.
    - Variabel CSS: `var(--lembaran-name)`.

# Panduan Mulai Cepat Lembaran

Selamat datang di **Lembaran**, platform brankas data personal yang aman dan terenkripsi. Panduan ini akan membantu Anda menyiapkan sistem dan mengelola data Anda secara mandiri.

## ⚡ Prasyarat

Sebelum menginstal Lembaran, pastikan alat-alat berikut sudah terpasang di sistem Anda:

1.  **Bun Runtime**: Runtime JavaScript tercepat.
    - [Unduh & Instal Bun](https://bun.sh)
2.  **Git**: Untuk kontrol versi dan mengunduh repositori.
    - [Unduh & Instal Git](https://git-scm.com)

## 🚀 Instalasi

### 1. Instalasi Satu Baris (Rekomendasi)
Buka terminal Anda dan jalankan:
```bash
curl -fsSL https://lembaran.vercel.app/install.sh | bash
```
*Catatan: Bagi pengguna Windows, pastikan Anda menggunakan Git Bash untuk menjalankan perintah ini.*

### 2. Instalasi Manual
Jika Anda lebih suka menyiapkannya secara manual:
```bash
# Clone repositori
git clone https://github.com/Abelion512/lembaran.git
cd lembaran

# Instal dependensi dan daftarkan CLI
bun install
bun link
```

## 🎭 Menjalankan Pertama Kali

Setelah terinstal, Anda bisa memulai antarmuka terminal interaktif (TUI) dengan mengetik:
```bash
lembaran mulai
```

### Langkah Persiapan Awal:
1.  **Inisialisasi Brankas**: Sistem akan mendeteksi jika brankas Anda belum disiapkan.
2.  **Buat Kata Sandi**: Pilih kata sandi yang kuat. **Penting:** Kami tidak menyimpan kata sandi Anda. Jika Anda lupas, data Anda tidak dapat dipulihkan.
3.  **Mulai Menulis**: Gunakan perintah `ukir` atau antarmuka web untuk menyimpan catatan pertama Anda.

## 🌐 Antarmuka Web

Jika Anda lebih suka pengalaman visual, Anda dapat menjalankan aplikasi web:
```bash
bun run dev
```
Lalu buka [http://localhost:1400](http://localhost:1400) di browser Anda.

## 📚 Pelajari Lebih Lanjut
- [Referensi Perintah CLI](/bantuan/cli)
- [Arsitektur Keamanan](/bantuan/keamanan)

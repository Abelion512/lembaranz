
Lembaranz menggunakan arsitektur data yang transparan namun aman. Memahami struktur ini akan membantu Anda dalam melakukan audit mandiri terhadap data Anda.

## 1. Objek Catatan (Note)

Setiap catatan disimpan sebagai objek JSON yang terenkripsi. Berikut adalah struktur internalnya:

- `id`: UUID unik.
- `title`: Judul catatan (Terenkripsi).
- `content`: Isi utama (Terenkripsi).
- `preview`: Ringkasan pendek (Terenkripsi).
- `tags`: Array kategori.
- `kredensial`: Objek khusus untuk username/password (Terenkripsi).
- `createdAt`: Timestamp pembuatan.
- `updatedAt`: Timestamp perubahan terakhir.
- `_hash`: Hash SHA-256 untuk memverifikasi integritas data.

## 2. Penyimpanan Lokal

Data disimpan di **IndexedDB** (untuk versi Web) atau **JSON File** (untuk versi CLI).

- Tidak ada database cloud pusat.
- Tidak ada sinkronisasi otomatis ke server pihak ketiga.
- Sinkronisasi antar perangkat dilakukan secara manual melalui ekspor/impor `.lembaranz`.

## 3. Keamanan Kredensial

Kredensial dalam catatan diperlakukan dengan tingkat isolasi yang lebih tinggi. Mereka tidak hanya terenkripsi, tetapi juga tidak disertakan dalam indeks pencarian teks biasa untuk mencegah kebocoran yang tidak disengaja.

## 4. Sistem Dokumentasi (Bantuan)

Dokumentasi Lembaranz dikelola secara lokal di dalam folder `docs/`.

### Cara Menambah Halaman Bantuan Baru:
1. **Buat file Markdown**: Tambahkan file `.md` di `docs/id/` (Bahasa Indonesia) dan `docs/en/` (Bahasa Inggris). Gunakan nama file yang sama.
2. **Daftarkan di Metadata**: Buka `docs/indeks.json` dan tambahkan entri baru pada bagian `id` dan `en`.
   - Gunakan slug yang sama dengan nama file sebagai key.
   - Sertakan `title`, `desc`, `icon` (Lucide icon name), dan `color`.
3. **PETA_SLUG**: Jika slug mengandung karakter khusus, daftarkan di `PETA_SLUG` pada `packages/web/lib/ambilKontenDok.ts` untuk memastikan akses yang aman.

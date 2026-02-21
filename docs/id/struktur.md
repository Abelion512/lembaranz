
Lembaran menggunakan arsitektur data yang transparan namun aman. Memahami struktur ini akan membantu Anda dalam melakukan audit mandiri terhadap data Anda.

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
- Sinkronisasi antar perangkat dilakukan secara manual melalui ekspor/impor `.lembaran`.

## 3. Keamanan Kredensial

Kredensial dalam catatan diperlakukan dengan tingkat isolasi yang lebih tinggi. Mereka tidak hanya terenkripsi, tetapi juga tidak disertakan dalam indeks pencarian teks biasa untuk mencegah kebocoran yang tidak disengaja.

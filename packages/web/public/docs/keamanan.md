
Di Lembaran, keamanan bukan sekadar fitur tambahan, melainkan fondasi utama. Kami menerapkan prinsip **Zero-Knowledge** dan **Integritas Kriptografis** yang terinspirasi dari teknologi blockchain.

## 1. Segel Digital (Integritas Data)

Setiap catatan yang Anda simpan akan diberi "Segel Digital" (Hash SHA-256). Ini berfungsi seperti sidik jari digital yang unik untuk setiap konten.

### Bagaimana Cara Kerjanya?

```mermaid
sequenceDiagram
    participant User as Pengguna
    participant App as Aplikasi (Lokal)
    participant Storage as Penyimpanan

    User->>App: Menulis Catatan "Rahasia"
    Note right of App: Hitung SHA-256 Hash<br/>(Sidik Jari Digital)
    App->>App: Tambahkan Segel "_hash"
    App->>Storage: Simpan Data + Segel
    
    Note over User, Storage: ... Beberapa waktu kemudian ...
    
    User->>App: Buka Catatan
    Storage->>App: Muat Data
    App->>App: Hitung Ulang Hash dari Isi
    alt Hash Cocok
        App->>User: Tampilkan Catatan (Aman)
    else Hash Berbeda
        App->>User: PERINGATAN! Data Termodifikasi
    end
```

Jika ada satu karakter saja yang berubah tanpa melalui aplikasi (misalnya dimanipulasi oleh malware), "Segel Digital" akan rusak dan aplikasi akan mendeteksi perubahan tersebut.

## 2. Enkripsi Zero-Knowledge

Kami menggunakan algoritma **Argon2id** (pemenang Password Hashing Competition) untuk mengubah kata sandi Anda menjadi kunci enkripsi yang sangat kuat.

- **Kunci Hanya di Memori**: Kata sandi Anda tidak pernah disimpan ke disk atau dikirim ke server.
- **Isolasi**: Bahkan kami (pengembang) tidak bisa membaca catatan Anda karena kami tidak memiliki kunci tersebut.

```mermaid
flowchart LR
    Pass[Kata Sandi] -->|Argon2id| Key[Kunci Enkripsi]
    Data[Catatan Asli] -->|AES-GCM| Enc[Data Teracak]
    Key --> Enc
    Enc --> Disk[Penyimpanan Fisik]
    
    style Pass fill:#f9f,stroke:#333,stroke-width:2px
    style Key fill:#bbf,stroke:#333,stroke-width:2px
    style Enc fill:#bfb,stroke:#333,stroke-width:2px
```

## Transparansi Kode

Seluruh logika keamanan ini bersifat *open-source* dan dapat diaudit di file:
- `src/aksara/kunci.ts` (Enkripsi)
- `src/aksara/Integritas.ts` (Validasi Data)

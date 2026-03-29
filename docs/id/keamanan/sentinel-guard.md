# Sentinel Guard (Penjaga Integritas)

Sentinel Guard adalah protokol lapis ketiga dalam arsitektur keamanan Lembaran yang berfokus pada **Pencegahan Eksploitasi, Keamanan Sisi Klien, dan Integritas Akses Cepat**.

## 1. Perlindungan Timing Attack (XOR Shield)

Salah satu celah klasikal yang sering terjadi pada perbandingan kunci atau hashing sederhana adalah serangan pengatur waktu (*Timing Attack*). Penyerang mengukur seberapa lama komputasi dilakukan untuk menebak kebenaran byte secara berurutan.

Lembaran mengadopsi operasi **Bitwise XOR Berwaktu Konstan (Constant-Time Compare)** di dalam `Sentinel.ts`:

-   Jika dua panjang string tidak sama, operasi tidak segera mengembalikan `false` di tingkat byte. Ia tetap melakukan operasi *dummy loop* XOR yang proporsional sehingga waktu komputasi yang diamati oleh penyerang tetap identik.
-   Evaluasi kecocokan dievaluasi secara keseluruhan menggunakan agregasi bitwise (`result |= byte`), memastikan mesin mengevaluasi seluruh blok byte tanpa optimasi sirkuit pintas (Short-circuit optimization).

## 2. Dynamic Rate Limiting

Pada arsitektur CLI dan TUI yang memungkinkan akses repetitif cepat (melalui script), kami menetapkan *throttle* ketat:

-   Hanya ada 5 percabangan percobaan pembukaan brankas maksimal per interval statis.
-   Jika upaya mencoba paksa (*Brute Force*) terdeteksi, operasi CLI akan dikunci sementara selama blok durasi 5 menit (Lockout Duration).

## 3. Isolasi Keadaan (State Isolation)

Mulai versi 3.5.0, Lembaran yang bergeser ke ranah "CLI-first" membersihkan seluruh ketergantungan Redux atau React Context dari web yang berisiko mempertahankan kunci terdekripsi dalam RAM browser. Pada CLI, data brankas bersifat fana dan hanya dipertahankan dalam node child process selama perintah dieksekusi, sebelum GC terpicu (atau buffer dihapus manual).

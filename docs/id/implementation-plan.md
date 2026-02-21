## Fase 1: Konsolidasi Agen & Instalasi Skill

Terjadi kebingungan antara `.agent` (tunggal) dan `.agents` (jamak). Folder `.agent` saat ini sudah ada di repo, namun symlink di root salah merujuk ke `.agents`. Kita akan standarisasi menggunakan `.agent`.

### Langkah:
1. Hapus direktori `skills/` dan folder `.agents` (jika ada) yang merujuk pada direktori yang salah.
2. Konsolidasi semua skill dan instruksi ke dalam `.agent/skills/`.
3. Instal ulang skill inti via `npx`: `find-skills`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `security-review`, `typescript-advanced-types`.

---

## Fase 2: CLI Puitis & Antarmuka Keamanan — `lembaran`

### Masalah & Solusi UX:
Pengguna sering bingung antara Enter/Space di terminal. TUI akan diperkaya dengan instruksi eksplisit: `(Gunakan panah ↑↓ dan Tekan ENTER untuk memilih)`.

### Perubahan Vibe & Fitur Baru:
Menggunakan istilah yang lebih progresif dan puitis sesuai tema "Aksara/Brankas":

| Perintah Lama | Perintah Baru | Deskripsi Vibe |
|---------------|---------------|----------------|
| `ui`          | `mulai`       | Menjalankan TUI dengan instruksi UX lengkap (Default) |
| `status`      | `pantau`      | Memantau kesehatan dan integritas sistem |
| `list`        | `jelajah`     | Menjelajahi arsip catatan terenkripsi |
| `hapus`       | `hangus`      | Memusnahkan catatan secara permanen |
| `export`      | `petik`       | Memetik (export) data ke file lokal |
| **(NEW) login** | **`kuncung`**  | Masuk/Membuka kunci brankas (Manual/Web) |
| **(NEW) import**| **`tanam`**   | Menanamkan (import) data eksternal ke arsip |

### Alur Kriptografi & Registrasi (Visi Multi-platform):
1. **Login (`kuncung`)**:
   - Opsi 1: Masukkan kata sandi secara manual di terminal.
   - Opsi 2: Login via Web (Mengarahkan pengguna ke URL web untuk autentikasi).
2. **Registrasi & Mantra Pemulihan**:
   - Jika pengguna mencoba membuat akun/password baru di CLI, sistem akan memberikan narasi puitis:
     > *"Wahai Pengembang, penciptaan kunci abadi wajib dilakukan melalui Gerbang Web. Di sana, Mantra Pemulihan (12 Kata Aksara) akan dianugerahkan untuk menjaga kedaulatan datamu."*
   - Arahan eksplisit ke URL registrasi web.

### Teknis:
1. Perbarui `package.json` dengan `"bin": { "lembaran": "./bin/lembaran" }`.
2. Modifikasi `bin/lembaran` dan `TUI.ts` untuk mendukung perintah baru dan instruksi UX.

---

## Fase 3: Audit, Pembersihan & Optimasi

### Menghapus Redundansi (Library & File):
1. **Library Bloat**: Hapus `dexie` (diganti `idb`) dan `argon2-browser` (diganti `@noble/hashes`) dari `package.json`.
2. **Limbah Root**: 9 `build_log_*.txt`, 2 `.log`, 2 `.diff`, `SARAN*.md` (3 file), `REVIEW.md`, `CATATAN_PENGERJAAN.md`.
3. **Legacy**: Direktori `arsip_legacy/` (63 file) yang sudah tidak terpakai.

### Audit Keamanan & Potensi Kerusakan:
- **Integritas Segel**: `Arsip.ts` akan dikonsolodasikan agar menggunakan `stripHtml` dari `Penyaring.ts`.
- **Visi Web/Native**: Memastikan `Gudang.ts` bersifat universal untuk APK Native nantinya.
- **Hydration Safety**: Audit komponen UI agar tidak mengakses `window` sebelum mount.

## Fase 4: Distribusi & Standalone
- Tambahkan script `build:cli` ke `package.json`.
- Kompilasi `lembaran.exe` (Standalone Binary).
- Verifikasi eksekusi binary.

## Fase 5: Decoupling Arsitektur
- Refactor `Gudang.ts` menggunakan Adapter Pattern.
- Implementasi `FileAdapter` (JSON) untuk CLI/Node dan `BrowserAdapter` (IDB) untuk Web.
- Konfigurasi `package.json` "browser" field untuk shimming module `fs`.
- Verifikasi build Web dan CLI berjalan independen.

## Fase 6: Dokumentasi & Halaman Informasi
- Pembuatan file root: `LICENSE` (MIT), `CONTRIBUTING.md`, `TERMS.md`, `PRIVACY.md`.
- Halaman `/tentang` sebagai hub informasi legal dan versi.
- Halaman `/changelog`, `/ketentuan`, `/privasi` merender konten Markdown dari root secara dinamis (Server Components).
- Integrasi `llms.txt` untuk memastikan konteks proyek ramah terhadap AI lain.

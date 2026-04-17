# @lembaranz/cli

**Lembaranz CLI - Brankas Aksara Personal yang Berdikari** 🇮🇩

Antarmuka baris perintah (CLI) and TUI resmi untuk Lembaranz. Amankan catatan, ide, and rahasia Anda langsung di terminal dengan enkripsi tingkat militer.

## 🚀 Instalasi

```bash
# Via Bun (Disarankan)
bun install -g @lembaranz/cli

# Via NPM
npm install -g @lembaranz/cli
```

## 🛠️ Penggunaan

Jalankan perintah utama untuk masuk ke antarmuka interaktif:

```bash
lembaranz mulai
```

### Perintah Lainnya

- `lembaranz ukir`: Membuat catatan baru secara cepat.
- `lembaranz laras`: Mengelola variabel lingkungan (.env) proyek Anda.
- `lembaranz tanam`: Mengimpor direktori dokumen ke dalam brankas.
- `lembaranz petik`: Mengekspor catatan terenkripsi ke format cadangan.
- `lembaranz cari`: Mencari di seluruh arsip yang terenkripsi.

## 🔐 Keamanan

- **Zero-Knowledge**: Kata sandi Anda tidak pernah disimpan or dikirim.
- **Argon2id**: Derivasi kunci yang sangat kuat terhadap serangan GPU.
- **AES-GCM 256**: Standar enkripsi industri untuk integritas data.
- **Rate-limit Unlock Feedback**: CLI memberi estimasi menit tunggu minimum dan sisa percobaan buka brankas secara konsisten.

## 📄 Lisensi

[MIT](https://github.com/Abelion512/lembaranz/blob/main/LICENSE)

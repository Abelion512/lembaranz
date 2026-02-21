
Lembaran CLI adalah pendamping setia bagi para pengembang. Ia dirancang untuk kecepatan, otomatisasi, dan kemudahan integrasi dengan alur kerja terminal Anda.

## Instalasi

### Menggunakan Bun (Sangat Direkomendasikan)
Bun adalah runtime tercepat untuk menjalankan Lembaran CLI.
```bash
bun install -g Abelion512/lembaran
```

### Menggunakan NPM
```bash
npm install -g Abelion512/lembaran
```

## Troubleshooting Instalasi

Jika Anda mengalami masalah "Module not found" atau perintah `lembaran` merujuk ke path lama (`abelion-notes`), lakukan pembersihan cache global:

```bash
bun remove -g abelion-notes lembaran
# ATAU jika menggunakan npm
npm uninstall -g abelion-notes lembaran
```

Setelah itu, ulangi proses instalasi.

## Menjalankan CLI

Setelah instalasi, perintah `lembaran` akan tersedia secara global.

### 1. Mode Interaktif (TUI)
Ketik perintah berikut untuk masuk ke antarmuka visual terminal:
```bash
lembaran mulai
```

### 2. Mode Perintah Langsung
Anda juga dapat menjalankan perintah spesifik tanpa masuk ke menu utama:
```bash
lembaran pantau    # Melihat status sistem
lembaran jelajah   # Mencari catatan
```

## Aksara Shell Prompt

Saat Anda menjalankan `lembaran mulai`, Anda akan memasuki **Aksara Shell**. Prompt akan berubah menjadi `aksara ❯`. Di sini, Anda dapat mengetikkan perintah secara langsung tanpa awalan `lembaran`.

Contoh:
- `pantau`
- `jelajah "Server Config"`
- `ukir` (untuk membuat catatan baru)

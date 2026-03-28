# Lembaran

**Brankas Arsip Digital Personal Buatan Indonesia** 🇮🇩

[![Version](https://img.shields.io/npm/v/lembaran.svg)](https://www.npmjs.com/package/lembaran)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made in Indonesia](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-Indonesia-red)](https://github.com/Abelion512/lembaran)

> **Kedaulatan Data untuk Semua.** Enkripsi zero-knowledge, fokus CLI/TUI, tanpa gimmick.

---

## 🚀 Mulai Cepat

### Instalasi (1 Baris)

```bash
# Cara tercepat (recommended)
curl -fsSL https://lembaran.vercel.app/install.sh | bash

# Atau via Bun
bun install -g Abelion512/lembaran

# Atau via npm
npm install -g @lembaran/cli
```

### Penggunaan Pertama

```bash
# Jalankan TUI interaktif
lembaran mulai

# Buat catatan pertama
lembaran ukir

# Kelola environment (.env)
lembaran laras
```

---

## ✨ Fitur Utama

### 🔐 Brankas (Security)
- Enkripsi AES-GCM 256-bit (standar industri)
- Key derivation Argon2id (anti-GPU cracking)
- Auto-lock setelah 1 menit idle
- Panic key untuk emergency wipe

### 📝 CLI Commands
```bash
lembaran mulai    # TUI interaktif
lembaran ukir     # Buat/edit catatan
lembaran laras    # Kelola .env projects
lembaran tanam    # Import direktori
lembaran cari     # Search encrypted notes
lembaran petik    # Export catatan
```

### 🌐 Web (Landing & Docs)
- Landing page informatif
- Dokumentasi lengkap (Bahasa Indonesia)
- Changelog terupdate
- **Web vault: Coming soon** (fokus saat ini: CLI/TUI)

---

## 🛠️ Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Bun 1.3+ |
| Language | TypeScript 5.x |
| Encryption | @noble/ciphers (AES-GCM) |
| CLI Framework | Ink (React for Terminal) |
| Web | Next.js 16, React 19, Tailwind CSS v4 |

---

## 📦 Struktur Monorepo

```
lembaran/
├── packages/core    # Logika enkripsi & storage
├── packages/cli     # CLI commands & TUI
├── packages/web     # Landing page & dokumentasi
├── docs/            # Dokumentasi lengkap
└── scripts/         # Helper scripts
```

---

## 🤝 Kontribusi

Kami terbuka untuk kontribusi dari developer Indonesia!

### Cara Mulai
1. Fork repository ini
2. Clone fork Anda: `git clone https://github.com/USERNAME_ANDA/lembaran.git`
3. Install dependencies: `bun install`
4. Buat branch fitur: `git checkout -b fitur/fitur-keren`
5. Commit perubahan: `git commit -m "feat: tambah fitur keren"`
6. Push ke branch: `git push origin fitur/fitur-keren`
7. Buat Pull Request

### Panduan
- Gunakan **Bahasa Indonesia baku** untuk komentar kode dan dokumentasi
- Ikuti konvensi commit: `feat:`, `fix:`, `docs:`, `chore:`
- Pastikan semua test pass: `bun run lint && bun run test`
- Update dokumentasi jika menambah fitur baru

📖 **Dokumentasi Lengkap:** [docs/](docs/)

---

## 📄 Lisensi

Dibagikan di bawah lisensi [MIT](LICENSE) — bebas digunakan, dimodifikasi, dan didistribusikan.

---

## 👨‍💻 Tim Pengembang

**Lead Developer:**  
Abelion Lavv ([@Abelion512](https://github.com/Abelion512))

**Kontributor:**  
Terima kasih untuk semua kontributor open source! 🙏

---

## 🇮🇩 Dibuat dengan Bangga di Indonesia

Lembaran adalah proyek open source buatan pengembang Indonesia untuk mendukung kedaulatan data lokal.

> **"Data Anda adalah hak Anda. Jangan percayakan pada cloud korporat."**

---

## 📞 Kontak & Dukungan

- **GitHub Issues:** [Laporkan bug atau request fitur](https://github.com/Abelion512/lembaran/issues)
- **Diskusi:** [Tanya jawab & diskusi umum](https://github.com/Abelion512/lembaran/discussions)
- **Email:** agen.salva@gmail.com

---

**Versi:** 3.4.0 | **Status:** Production Ready | **Fokus:** CLI/TUI

Made with ❤️ in Indonesia 🇮🇩

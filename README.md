# Lembaran

Lembaran adalah platform arsip digital personal yang aman, berbasis local-first, dengan fokus pada kedaulatan data dan pengalaman pengguna premium.

## Quick Start

1. **Install Lembaran via Terminal** (Rekomendasi):
   ```bash
   curl -fsSL https://lembaran.vercel.app/install.sh | bash
   ```

   *Jika Anda mengalami masalah "Module not found" dari versi lama (abelion-notes), jalankan perintah berikut untuk membersihkan cache:*
   ```bash
   bun remove -g abelion-notes lembaran
   ```

2. **Instalasi via Bun Global**:
   ```bash
   bun install -g Abelion512/lembaran
   ```

3. **Manual Setup (Developer)**:
   **Install Bun Runtime**: [bun.sh](https://bun.sh)
4. **Clone & Setup**:
   ```bash
   git clone https://github.com/Abelion512/lembaran.git
   cd lembaran
   bun install
   ```
5. **Run Web Interface**:
   ```bash
   bun run dev
   ```
6. **Run Management TUI**:
   ```bash
   lembaran mulai
   # Atau akses fitur lain: lembaran pantau | jelajah | ukir
   ```

## Features

- **End-to-End Encryption**: Data dienkripsi menggunakan AES-GCM 256-bit sisi klien.
- **Local-First Architecture**: Database utama menggunakan IndexedDB (via `idb`).
- **Interactive TUI/CLI (`lembaran`)**: Alat manajemen terminal puitis untuk efisiensi developer.
- **Credential Storage**: Template khusus untuk menyimpan username, password, dan URL secara aman.
- **Gmail Camouflage**: Mode rahasia untuk menyamarkan layar kunci brankas.

## Configuration

Saat ini aplikasi dikonfigurasi melalui antarmuka **Setelan (Laras)** di dalam aplikasi.

| Fitur | Deskripsi | Default |
|-------|-----------|---------|
| Tema | Tampilan Terang, Gelap, atau Otomatis | Otomatis |
| Mode Rahasia | Penyamaran sebagai login Gmail | Mati |
| Kunci Otomatis | Durasi sebelum brankas terkunci otomatis | 1 Menit |

## Documentation

- [Manajemen CLI & API](./docs/cli.md)
- [Peningkatan Masa Depan](./docs/future_improvements.md)
- [Log Perubahan (Changelog)](./CHANGELOG.md)
- [Architecture Decision Records (ADR)](./docs/adr-001-tui-implementation.md)

## License

MIT - Dikelola oleh Lembaga Arsip Digital Lembaran.

---

## 🧠 Agent Skills

Repositori ini mendukung sistem **Agent Skills** standar industri (.agent/skills) untuk efisiensi pengembangan menggunakan AI.
Skill terintegrasi: `find-skills`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `security-review`, `typescript-advanced-types`.

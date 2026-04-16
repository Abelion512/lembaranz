# Product Requirements Document (PRD): Lembaran

**Versi:** 3.5.0
**Status:** Production Ready — CLI/TUI Stabil, GUI Phase 2
**Tanggal:** 13 April 2026
**Bahasa:** Indonesia Baku
**Branch:** `#33`

> **Lembaran**: Brankas Arsip Digital Personal Buatan Anak Bangsa  
> **Filosofi:** Kedaulatan Data, Privasi Absolut, Estetika Minimalis  
> **Konvensi Nama:** Indonesia Puitis (Jiwa, Raga, Suara, Aksara, Brankas)

---

## 1. Identitas & Filosofi

Lembaran adalah brankas arsip digital personal yang dikembangkan oleh pengembang Indonesia untuk kedaulatan data lokal.

### Visi
Menjadi standar emas penyimpanan data personal terenkripsi yang **dibuat di Indonesia untuk dunia**.

### Prinsip Utama
- **Local-First**: Data Anda tetap di perangkat Anda
- **Privacy-First**: Enkripsi zero-knowledge, tidak ada yang bisa mengakses kecuali Anda
- **CLI-First**: Fokus pada terminal/TUI untuk developer productivity
- **Minimalis**: Estetika bersih tanpa gimmick berlebihan
- **Terbuka**: Format data terbuka, tidak ada vendor lock-in

### Target Pengguna
1. **Developer Indonesia**: Butuh manajemen `.env` aman dan CLI yang efisien
2. **Pegiat Privasi**: Menghindari surveillance cloud korporat
3. **Power Users Terminal**: Nyaman dengan keyboard-first workflow

---

## 2. Stack Teknologi

### Core (Jiwa)
- **Runtime**: Bun 1.3+ (cepat, native TypeScript)
- **Language**: TypeScript 5.x
- **Encryption**: `@noble/ciphers` (AES-GCM 256-bit)
- **Key Derivation**: `@noble/hashes` (Argon2id)
- **Integrity**: SHA-256 (digital seal)
- **Storage**: IndexedDB (web), Filesystem (CLI)

### Interface (Raga & Suara)
- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **CLI/TUI**: Ink (React for Terminal), Commander.js
- **Animation**: Framer Motion (web only)
- **Editor**: Tiptap (Markdown-based)

### Infrastructure
- **Package Manager**: Bun (monorepo workspaces)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (web), npm/Bun (CLI)

---

## 3. Arsitektur Sistem

### A. Brankas (Security Layer)
Enkripsi zero-knowledge dengan standar industri tertinggi.

**Fitur:**
- AES-GCM 256-bit encryption
- Argon2id key derivation (memory-hard, anti-GPU)
- Auto-lock setelah 1 menit idle
- Panic key untuk emergency wipe
- Digital seal (SHA-256) untuk integrity check

**Status:** ✅ Production Ready

### B. Gudang Aksara (Note Management)
Manajemen catatan terenkripsi dengan CLI-first approach.

**Fitur:**
- CRUD operations via CLI
- Markdown support
- Tag-based organization
- Fuzzy search (encrypted content)
- Import/export (.md, .json)

**Status:** ✅ Production Ready (CLI), ⏳ Web UI deprecated

### C. Laras (Environment Manager)
Pengelolaan `.env` lintas proyek dengan enkripsi.

**Fitur:**
- Simpan `.env` ke brankas terenkripsi
- Load `.env` ke project lokal
- Overwrite protection dengan konfirmasi
- Multi-project support dengan tagging

**Status:** ✅ Production Ready (CLI)

### D. Suara (CLI/TUI)
Antarmuka terminal interaktif untuk produktivitas maksimal.

**Commands:**
- `lembaran mulai` - TUI interaktif
- `lembaran ukir` - Buat/edit catatan
- `lembaran laras` - Kelola environment
- `lembaran tanam` - Import direktori
- `lembaran cari` - Search encrypted notes
- `lembaran petik` - Export catatan

**Status:** ✅ Production Ready

---

## 4. Roadmap & Progress

### Fase 1 — Pondasi (MVP) ✅ **SELESAI 100%**
- [x] Setup Monorepo (Core, Web, CLI)
- [x] Implementasi Brankas (AES-GCM + Argon2id)
- [x] CLI Commands (ukir, laras, tanam, cari)
- [x] TUI Interaktif (Ink-based)
- [x] Digital Seal (SHA-256 integrity)
- [x] Auto-lock & panic key

### Fase 2 — Fitur Utama (Ciri Khas) ✅ **SELESAI 85%**
- [x] Laras (.env manager) dengan overwrite protection
- [x] TUI dengan logo Lembaran (seperti gemini/claude)
- [x] Fuzzy search encrypted content
- [x] Import/export multi-format
- [x] AI YOLO Mode security (single-push)
- [ ] Graph visualization (Peta Aksara) — **50%**

### Fase 3 — Ekspansi (Community & Polish) ⏳ **PLANNED**
- [ ] Documentation lengkap Bahasa Indonesia
- [ ] Benchmark suite (1000 notes stress test)
- [ ] Native apps (iOS/Android/Desktop)
- [ ] Biometric unlock (WebAuthn)
- [ ] Sync bridge (E2EE personal cloud)

**Overall Progress: ~75%** (Fase 1 ✅, Fase 2 🔄, Fase 3 📋)

---

## 5. Struktur Folder

```
lembaran/
├── packages/
│   ├── core/          # @lembaran/core (encryption, storage)
│   ├── cli/           # @lembaran/cli (TUI, commands)
│   └── web/           # @lembaran/web (landing page, docs)
├── docs/              # Dokumentasi (id/ & en/)
├── .githooks/         # Git hooks (YOLO mode)
├── scripts/           # Helper scripts
├── .github/
│   ├── workflows/     # CI/CD
│   └── dependabot.yml # Auto-updates
├── PRD.md             # This file
├── CHANGELOG.md       # Version history
├── README.md          # Quick start
└── package.json       # Monorepo root
```

---

## 6. Non-Goals (Yang TIDAK Akan Dibangun)

❌ **Web Vault UI** — Fokus ke CLI/TUI untuk developer  
❌ **Cloud Sync** — Local-first, data tetap di perangkat  
❌ **Collaboration** — Personal vault, bukan team tool  
❌ **Mobile Apps** — Prioritas CLI desktop experience  
❌ **Gimmick Features** — Minimalis, fungsional, tanpa bloat  

---

## 7. Metrics & Success Criteria

### Technical Metrics
- **Encryption**: AES-GCM 256-bit, Argon2id (19MB RAM, 2 iterations)
- **Performance**: <100ms decrypt untuk note <10KB
- **Bundle Size**: CLI <2MB, Web <500KB (gzip)
- **Test Coverage**: >80% core modules

### User Metrics
- **Time to First Note**: <30 detik dari install
- **CLI Commands**: 6 commands utama (mulai, ukir, laras, tanam, cari, petik)
- **Documentation**: 100% Bahasa Indonesia baku

### Security Metrics
- **Zero-Knowledge**: Password tidak pernah disimpan/transmit
- **Auto-Lock**: 1 menit idle timeout
- **Panic Key**: Emergency wipe dalam <1 detik

---

## 8. Release History

| Version | Date | Status | Highlights |
|---------|------|--------|------------|
| 3.4.0 | Mar 2026 | Current | AI YOLO Mode, CLI focus, docs update |
| 3.3.0 | Feb 2026 | Stable | TUI modern, env protection |
| 3.0.0 | Feb 2026 | Stable | Monorepo, rebranding |
| 2.x | Feb 2026 | Legacy | Landing page, basic CLI |

---

## 9. Tim Pengembang

**Lead Developer:** Abelion Lavv  
**Kontributor:** Open Source Community  
**Lokasi:** Indonesia 🇮🇩  

---

**PRD ini adalah living document.** Update seiring perkembangan fitur dan feedback komunitas.

* Dibuat dengan ❤️ oleh pengembang Indonesia untuk kedaulatan data lokal.

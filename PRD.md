# Product Requirements Document (PRD): Lembaranz

**Version:** 3.5.0
**Status:** Production Ready — Stable CLI/TUI, GUI Planned
**Date:** April 13, 2026
**Language:** English
**Branch:** `#33`

> **Lembaranz**: Personal Digital Archive Vault Made by Indonesian Developers  
> **Philosophy:** Data Sovereignty, Absolute Privacy, Minimalist Aesthetics  
> **Naming Convention:** Poetic Indonesian Names (Jiwa, Raga, Suara, Aksara, Brankas)

---

## 1. Identity & Philosophy

Lembaranz is a personal digital archive vault developed by Indonesian developers for local data sovereignty.

### Vision
To become the gold standard for encrypted personal data storage **made in Indonesia for the world**.

### Core Principles
- **Local-First**: Your data stays on your device
- **Privacy-First**: Zero-knowledge encryption, no one can access except you
- **CLI-First**: Focus on terminal/TUI for developer productivity
- **Minimalist**: Clean aesthetics without excessive gimmicks
- **Open**: Open data formats, no vendor lock-in

### Target Users
1. **Indonesian Developers**: Need secure `.env` management and efficient CLI
2. **Privacy Advocates**: Avoiding corporate cloud surveillance
3. **Terminal Power Users**: Comfortable with keyboard-first workflow

---

## 2. Technology Stack

### Core (Jiwa/Soul)
- **Runtime**: Bun 1.3+ (fast, native TypeScript)
- **Language**: TypeScript 5.x
- **Encryption**: `@noble/ciphers` (AES-GCM 256-bit)
- **Key Derivation**: `@noble/hashes` (Argon2id)
- **Integrity**: SHA-256 (digital seal)
- **Storage**: IndexedDB (web), Filesystem (CLI)

### Interface (Raga/Body & Suara/Voice)
- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **CLI/TUI**: Ink (React for Terminal), Commander.js
- **Animation**: Framer Motion (web only)
- **Editor**: Tiptap (Markdown-based)

### Infrastructure
- **Package Manager**: Bun (monorepo workspaces)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (web), npm/Bun (CLI)

---

## 3. System Architecture

### A. Brankas (Security Layer)
Zero-knowledge encryption with highest industry standards.

**Features:**
- AES-GCM 256-bit encryption
- Argon2id key derivation (memory-hard, anti-GPU)
- Auto-lock after 1 minute idle
- Panic key for emergency wipe
- Digital seal (SHA-256) for integrity check

**Status:** ✅ Production Ready

### B. Gudang Aksara (Note Management)
Encrypted note management with CLI-first approach.

**Features:**
- CRUD operations via CLI
- Markdown support
- Tag-based organization
- Fuzzy search (encrypted content)
- Import/export (.md, .json)

**Status:** ✅ Production Ready (CLI)

### C. Laras (Environment Manager)
`.env` management across projects with encryption.

**Features:**
- Save `.env` to encrypted vault
- Load `.env` to local project
- Overwrite protection with confirmation
- Multi-project support with tagging

**Status:** ✅ Production Ready (CLI)

### D. Suara (CLI/TUI)
Interactive terminal interface for maximum productivity.

**Commands:**
- `lembaranz` - Interactive TUI (default)
- `lembaranz launch` - Interactive TUI
- `lembaranz browse [keyword]` - Search notes
- `lembaranz config` - Manage configurations and local `.env` (alias: `cfg`)
- `lembaranz import <path>` - Import `.md` files or restore a backup
- `lembaranz export` - Write an encrypted portable backup

**Status:** ✅ Production Ready

> Corrected October 2026. This section previously listed `start`, `carve`, `env`,
> `plant`, `search`, and `pick`. None of them were ever registered on the
> Commander program; the list above is the real surface, asserted by
> `packages/cli/src/__tests__/commands.test.ts`. Full details in
> [`docs/en/cli.md`](docs/en/cli.md).

---

## 4. Roadmap & Progress

### Phase 1 — Foundation (MVP) ✅ **COMPLETE 100%**
- [x] Setup Monorepo (Core, CLI)
- [x] Implement Brankas (AES-GCM + Argon2id)
- [x] CLI Commands (setup, browse, config, import, export)
- [x] Interactive TUI (Ink-based)
- [x] Digital Seal (SHA-256 integrity)
- [x] Auto-lock & panic key

### Phase 2 — Core Features (Signature) ✅ **COMPLETE 85%**
- [x] Laras (.env manager) with overwrite protection
- [x] TUI with Lembaranz logo (like gemini/claude)
- [x] Fuzzy search encrypted content
- [x] Import/export multi-format
- [x] AI YOLO Mode security (single-push)
- [ ] Graph visualization (Peta Aksara) — **50%**

### Phase 3 — Expansion (Community & Polish) ⏳ **PLANNED**
- [ ] Complete documentation in English
- [ ] Benchmark suite (1000 notes stress test)
- [ ] Native apps (iOS/Android/Desktop)
- [ ] Biometric unlock (WebAuthn)
- [ ] Sync bridge (E2EE personal cloud)

**Overall Progress: ~75%** (Phase 1 ✅, Phase 2 🔄, Phase 3 📋)

---

## 5. Folder Structure

```
lembaranz/
├── packages/
│   ├── core/          # @lembaranz/core (encryption, storage)
│   └── cli/           # lembaranz (unscoped package TUI, commands)
├── docs/              # Documentation (en/)
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

## 6. Non-Goals (What Will NOT Be Built)

❌ **Web Vault UI** — Focus on CLI/TUI for developers  
❌ **Cloud Sync** — Local-first, data stays on device  
❌ **Collaboration** — Personal vault, not team tool  
❌ **Mobile Apps** — Priority on CLI desktop experience  
❌ **Gimmick Features** — Minimalist, functional, no bloat  

---

## 7. Metrics & Success Criteria

### Technical Metrics
- **Encryption**: AES-GCM 256-bit, Argon2id (64 MiB RAM, 2 iterations, p=1)
- **Performance**: <100ms decrypt for note <10KB
- **Bundle Size**: CLI <2MB, Web <500KB (gzip)
- **Test Coverage**: floors enforced in CI, currently core 73%, dashboard 84%

### User Metrics
- **Time to First Note**: <30 seconds from install
- **CLI Commands**: 12 registered commands (`setup`/`init`, `launch`, `browse`, `config`/`cfg`, `doctor`, `dashboard`, `server`, `import`, `export`, `monitor`, `security`, plus `update` and the default TUI)
- **Documentation**: 100% English

### Security Metrics
- **Zero-Knowledge**: Password never stored/transmitted
- **Auto-Lock**: 1 minute idle timeout
- **Panic Key**: Emergency wipe in <1 second

---

## 8. Release History

| Version | Date | Status | Highlights |
|---------|------|--------|------------|
| 3.4.0 | Mar 2026 | Current | AI YOLO Mode, CLI focus, docs update |
| 3.3.0 | Feb 2026 | Stable | Modern TUI, env protection |
| 3.0.0 | Feb 2026 | Stable | Monorepo, rebranding |
| 2.x | Feb 2026 | Legacy | Landing page, basic CLI |

---

## 9. Development Team

**Lead Developer:** Abelion Lavv  
**Contributors:** Open Source Community  
**Location:** Indonesia 🇮🇩  

---

**This PRD is a living document.** Updated as features develop and community feedback is received.

* Made with ❤️ by Indonesian developers for local data sovereignty.

# Lembaran

**Personal Digital Archive Vault** 🔐

[![Version](https://img.shields.io/npm/v/lembaran.svg)](https://www.npmjs.com/package/lembaran)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)
[![Tests](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml/badge.svg)](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml)

![TUI Interface](docs/images/tui-mockup.png)

> **Your data belongs to you.** Zero-knowledge encryption, terminal-first design, no compromises.

---

## Overview

Lembaran is a **zero-knowledge encrypted note vault** that gives you complete control over your data. Built for developers who value privacy, it encrypts everything locally using industry-standard AES-GCM 256-bit encryption with Argon2id key derivation — meaning **nobody can read your notes, not even the developers**.

### Key Principles

- **Local-First**: All data stays on your device. No cloud sync, no telemetry, no tracking.
- **Zero-Knowledge**: Encryption happens before data touches storage. We never see your data.
- **Terminal-First**: Premium CLI/TUI experience for power users who live in the terminal.
- **Open Source**: MIT licensed, auditable, and extensible.

### Why Lembaran?

| Feature | Lembaran | Typical Note Apps |
|---------|----------|-------------------|
| Encryption | AES-GCM 256 + Argon2id | Proprietary or none |
| Data Location | Your device only | Cloud servers |
| Knowledge Model | Zero-knowledge | Full access |
| Terminal Support | ✅ Native TUI | ❌ Rarely |
| Open Source | ✅ MIT | ❌ Usually closed |
| Offline | ✅ Fully functional | ❌ Often limited |

---

## 🚀 Quick Start

### Installation

```bash
# Fastest method (recommended)
curl -sS https://lembaran.id/install.sh | bash

# Via Bun
bun install -g @lembaranz/cli

# Via npm
npm install -g @lembaranz/cli
```

### First Use

```bash
# Launch interactive TUI
lembaran launch

# Create your first note
lembaran write

# Manage project environments (.env files)
lembaran config
```

---

## ✨ Features

### 🔐 Military-Grade Security
- **AES-GCM 256-bit encryption** — Industry standard, hardware-accelerated
- **Argon2id key derivation** — Memory-hard, GPU/ASIC resistant
- **Auto-lock** — Locks after 60 seconds of inactivity
- **Panic key** — Emergency wipe with a special password
- **Integrity hashing** — Tamper detection on every note
- **Recovery mnemonic** — 12-word BIP39-style backup phrase

### 📝 CLI Commands
```bash
lembaran launch    # Interactive TUI dashboard
lembaran write     # Create or edit notes
lembaran config    # Manage .env project profiles
lembaran import    # Import markdown files or restore backups
lembaran search    # Search through encrypted notes
lembaran export    # Export encrypted backup
lembaran browse    # Browse notes by tags
lembaran monitor   # Monitor vault status
lembaran security  # Security settings
lembaran settings  # Application settings
```

### 🌐 Web Interface
- Landing page with documentation (lembaran.id)
- Full note management with rich text editor
- Multi-language support (English, Indonesian)
- **Note: Web is for documentation & showcase. Vault operations run in CLI/TUI.**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun 1.3+ / Node.js 20+ |
| Language | TypeScript 5.x |
| Encryption | @noble/ciphers (AES-GCM) + @noble/hashes (Argon2id) |
| CLI Framework | Ink (React for Terminal) |
| Web Framework | Next.js 16, React 19, Tailwind CSS v4 |
| State | Zustand |
| Rich Text | TipTap |
| On-device AI | WebLLM (optional) |

---

## 📦 Architecture

```
lembaran/ (Monorepo)
├── packages/
│   ├── core/          # @lembaranz/core — Encryption engine & storage
│   ├── cli/           # @lembaranz/cli — Terminal interface (TUI)
│   └── web/           # Landing page & documentation (private)
├── docs/              # Technical documentation
└── .github/workflows/ # CI/CD (lint, build, release, security scans)
```

### Security Architecture

```
User Password ──┐
                ├── Argon2id ──► Password Key ──┐
                                                 ▼
              Random ──► Master Key (AES-256) ──► Wrap ──► Storage
                                                 ▲
              Note Content ──────────────────────┘ (encrypt with Master Key)
```

- **Master Key**: Randomly generated, never stored in plaintext
- **Wrapped Key**: Master Key encrypted with Password Key, stored for unlock
- **Recovery**: Separate mnemonic path with its own wrapped key
- **Per-field Encryption**: Each note field encrypted independently

---

## 🤝 Contributing

We welcome contributions from developers worldwide!

### Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/lembaran.git
cd lembaran

# 2. Install dependencies
bun install

# 3. Run tests
bun test

# 4. Lint & build
bun run lint && bun run build
```

### Guidelines
- Use **English** for code comments and documentation
- Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`
- Ensure tests pass: `bun test && bun run lint`
- Update documentation for new features
- Use Changesets for version management

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

## 📞 Contact

- **Issues**: [Report bugs or request features](https://github.com/Abelion512/lembaran/issues)
- **Discussions**: [Q&A and general discussion](https://github.com/Abelion512/lembaran/discussions)
- **Email**: agen.salva@gmail.com

---

## 🔒 Security

Found a security vulnerability? Please **do not** open a public issue. Email us directly at [agen.salva@gmail.com](mailto:agen.salva@gmail.com) with details.

See [SECURITY.md](SECURITY.md) for our security policy.

---

**Version:** 3.5.0 | **Status:** Production Ready

Made with ❤️ for data sovereignty

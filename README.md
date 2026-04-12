# Lembaran

**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/lembaran.svg)](https://www.npmjs.com/package/lembaran)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)
[![Tests](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml/badge.svg)](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml)

![TUI Interface](docs/images/tui-mockup.png)

> **Your credentials belong to you.** Zero-knowledge encryption, self-hosted, no cloud dependencies.

---

## Overview

Lembaran is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for developers who value privacy, it encrypts everything locally using industry-standard AES-GCM 256-bit encryption with Argon2id key derivation — meaning **nobody can read your credentials, not even the developers**.

> ⚠️ **WARNING**: The web interface is for **LOCAL TESTING ONLY**. Do NOT deploy publicly as it handles unencrypted credentials in the browser.

### Key Principles

- **Local-First**: All data stays on your device. No cloud sync, no telemetry, no tracking.
- **Zero-Knowledge**: Encryption happens before data touches storage. We never see your data.
- **Terminal-First**: Premium CLI/TUI experience for power users who live in the terminal.
- **Open Source**: MIT licensed, auditable, and extensible.

### Why Lembaran?

| Feature | Lembaran | Typical Credential Managers |
|---------|----------|---------------------------|
| Encryption | AES-GCM 256 + Argon2id | Proprietary or none |
| Data Location | Your device only | Cloud servers |
| Knowledge Model | Zero-knowledge | Full access |
| Terminal Support | ✅ Native TUI | ❌ Rarely |
| Open Source | ✅ MIT | ❌ Usually closed |
| Offline | ✅ Fully functional | ❌ Often limited |
| Self-Hosted | ✅ Like n8n | ⚠️ Some require cloud |

### What Can You Store?

- 🔑 **API Keys** (OpenAI, Stripe, AWS, etc.)
- 🔐 **Passwords** (database, admin panels, etc.)
- 🌐 **Environment Variables** (.env files per project)
- 🎫 **Tokens** (JWT, OAuth, session tokens)
- 📝 **Secret Notes** (recovery codes, seed phrases, etc.)

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
#  NEW USER? Start here (interactive wizard):
lembaran setup

# Launch interactive TUI
lembaran launch

# Store your first credential
lembaran config save myproject

# Load credentials to current project
lembaran config load myproject

# List stored credentials
lembaran config list
```

> 💡 **Prefer GUI?** Run `lembaran setup` for a step-by-step wizard, or see `docs/BEGINNERS_GUIDE.md` for a visual guide.

---

## ✨ Features

### 🔐 Military-Grade Security
- **AES-GCM 256-bit encryption** — Industry standard, hardware-accelerated
- **Argon2id key derivation** — Memory-hard, GPU/ASIC resistant
- **Auto-lock** — Locks after 60 seconds of inactivity
- **Panic key** — Emergency wipe with a special password
- **Integrity hashing** — Tamper detection on every credential
- **12-word recovery mnemonic** — BIP39-style backup phrase (like crypto wallets)

### 📝 CLI Commands
```bash
lembaran launch           # Interactive TUI dashboard
lembaran config save      # Store .env/credentials to vault
lembaran config load      # Load credentials to project
lembaran config list      # List stored credential profiles
lembaran run              # Run command with injected credentials
lembaran settings         # Manage individual env vars locally
lembaran security         # Security dashboard
lembaran browse           # Search credentials by tags
```

### 🌐 Web Interface (LOCAL ONLY)
> ⚠️ **WARNING**: Do NOT deploy the web interface publicly. It's for local testing only.

- Landing page with documentation
- Basic credential management (like n8n self-hosted)
- Multi-language support (English, Indonesian)
- **Runs on localhost only** - no public deployment

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

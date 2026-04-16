# Lembaran

**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/@lembaranz/cli.svg)](https://www.npmjs.com/package/@lembaranz/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)
[![Tests](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml/badge.svg)](https://github.com/Abelion512/lembaran/actions/workflows/ci.yml)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.

---

## Overview

Lembaran is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for developers who value privacy, it encrypts everything locally using industry-standard AES-GCM 256-bit encryption with Argon2id key derivation — meaning **nobody can read your credentials, not even us**.

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
| Account Required | ❌ None | ✅ Usually |

### What Can You Store?

- 🔑 **API Keys** (OpenAI, Stripe, AWS, etc.)
- 🔐 **Passwords** (database, admin panels, etc.)
- 🌐 **Environment Variables** (`.env` files per project)
- 🎫 **Tokens** (JWT, OAuth, session tokens)
- 📝 **Secret Notes** (recovery codes, seed phrases, etc.)

---

## 🚀 Quick Start

### Installation

```bash
# npm (recommended)
npm install -g @lembaranz/cli

# bun
bun add -g @lembaranz/cli

# curl (one-liner)
curl -fsSL https://raw.githubusercontent.com/Abelion512/lembaran/#33/scripts/install.sh | bash

# docker
docker run -it ghcr.io/abelion512/lembaran:latest setup

# git clone
git clone https://github.com/Abelion512/lembaran.git && cd lembaran && bun install
```

### First Use

```bash
# Interactive setup wizard (takes 30 seconds)
lembaran setup

# Launch TUI dashboard
lembaran launch

# Store your first credential
lembaran ukir

# Load credentials into a project
lembaran muat
```

> 💡 **New here?** See the [Beginner's Guide](docs/BEGINNERS_GUIDE.md) for a step-by-step walkthrough.

---

## ✨ Features

### 🔐 Security
- **AES-GCM 256-bit encryption** with hardware acceleration
- **Argon2id key derivation** — memory-hard, GPU/ASIC resistant
- **Auto-lock** after inactivity
- **12-word recovery phrase** — like crypto wallets, store it safe
- **Integrity hashing** — tamper detection on every credential

### 💻 CLI Commands
```bash
lembaran setup            # Interactive setup wizard
lembaran launch           # TUI dashboard
lembaran ukir             # Create/edit credentials
lembaran muat             # Load .env into current project
lembaran browse           # Search by tags
lembaran security         # Security dashboard
```

### 🖥️ What You Get

| Platform | Status | Description |
|----------|--------|-------------|
| **CLI** | ✅ Production | Full TUI with vault management |
| **Desktop GUI** | 🚧 Planned | Native app (Tauri), visual interface |
| **Web Dashboard** | 🚧 Planned | Self-hosted via Docker, team access |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun 1.3+ / Node.js 20+ |
| Language | TypeScript 5.x |
| Encryption | @noble/ciphers (AES-GCM) + @noble/hashes (Argon2id) |
| CLI/TUI | Ink (React for Terminal), Commander.js |
| Web | Next.js 16, React 19, Tailwind CSS v4 |
| State | Zustand |

---

## 📦 Architecture

```
lembaran/
├── packages/
│   ├── core/          # @lembaranz/core — Encryption engine
│   └── cli/           # @lembaranz/cli — Terminal interface
├── docs/              # Documentation
├── .github/workflows/ # CI/CD
└── scripts/           # Install & utility scripts
```

### Security Flow

```
User Password ──┐
                ├── Argon2id ──► Password Key ──┐
                                                 ▼
              Random ──► Master Key (AES-256) ──► Wrap ──► Storage
                                                 ▲
              Data ──────────────────────────────┘
```

---

## 🤝 Contributing

```bash
# 1. Clone
git clone https://github.com/Abelion512/lembaran.git
cd lembaran

# 2. Install
bun install

# 3. Test & build
bun test
bun run lint
bun run build
```

### Guidelines
- **English** for code comments and docs
- [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`
- Use Changesets for version management
- Update docs for new features

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

## 📞 Contact

- **Issues**: [Report bugs](https://github.com/Abelion512/lembaran/issues)
- **Discussions**: [Q&A](https://github.com/Abelion512/lembaran/discussions)
- **Email**: agen.salva@gmail.com

### Security

Found a vulnerability? **Do not** open a public issue. Email [agen.salva@gmail.com](mailto:agen.salva@gmail.com) directly.

See [SECURITY.md](SECURITY.md) for our security policy.

---

**Version:** 1.0.0 | **Status:** Production Ready

Made with ❤️ in Indonesia 🇮🇩

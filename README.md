# Lembaranz
**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/lembaranz.svg)](https://www.npmjs.com/package/lembaranz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.

## Overview

Lembaranz is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for power users who live in the terminal, it encrypts everything locally using **AES-GCM 256-bit encryption** with **Argon2id (Hardened)** key derivation.

### Key Principles

- **Local-First**: All data stays on your device. No cloud sync, no telemetry.
- **Consolidated State**: Optimized for a single-branch (`testing`) workflow with high-performance crypto logic.
- **Zero-Knowledge**: Encryption happens before data touches storage.

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0 or Node.js >= 20.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz

# Install dependencies
bun install
```

### Usage

```bash
# Run setup wizard
bun run cli setup

# Launch TUI dashboard
bun run cli launch

# Browse archives
bun run cli browse

# Monitor system health
bun run cli monitor

# Security audit
bun run cli security
```

---

## ✨ Features

### 🔐 Security (Hardened)
- **AES-GCM 256-bit encryption** with optimized bitwise hex conversion
- **Argon2id (OWASP Hardened)**: High-memory cost for state-of-the-art brute-force resistance
- **Atomic Writes**: Database integrity protected against power loss or crashes
- **Integrity Hashing**: SHA-256 tamper detection on every entry with metadata exclusion

### 💻 CLI Commands
| Command | Description |
|---------|-------------|
| `lembaranz setup` | Interactive setup wizard |
| `lembaranz launch` | TUI dashboard |
| `lembaranz browse` | Fast searchable archive browser |
| `lembaranz monitor` | System health & integrity checks |
| `lembaranz security` | Security dashboard & audits |
| `lembaranz import` | Bulk credential import |
| `lembaranz export` | Encrypted portable backup |

### 📦 Additional Tools
- **Import/Export**: Backup and restore credentials securely
- **TUI Dashboard**: Beautiful terminal interface for managing secrets
- **Health Monitoring**: Automated integrity checks and system status

---

## 📦 Architecture

```
lembaranz/
├── packages/
│   ├── core/          # @lembaranz/core — Encryption & Storage engine
│   ├── cli/           # lembaranz — Terminal interface & Commands
│   └── dashboard/     # Web dashboard (optional)
├── docs/              # Documentation (EN & ID)
├── scripts/           # Utility scripts (security audit, etc.)
├── compose.yaml       # Docker Compose configuration
├── Dockerfile         # Container build instructions
└── README.md          # This file
```

### Package Structure

- **@lembaranz/core**: Core encryption, storage, and cryptographic operations
- **lembaranz (CLI)**: Command-line interface and TUI components
- **Dashboard**: Optional web-based interface (if available)

---

## 🛠️ Development

### Running Tests

```bash
# Run all tests
bun test

# Core package tests only
bun run test:core

# Performance tests
bun run test:perf
```

### Linting & Security

```bash
# Lint codebase
bun run lint

# Security audit
bun run security-audit
```

### Building for Production

```bash
# Build all packages
bun run build

# Publish packages (requires changeset)
bun run ci:release
```

---

## 🐳 Docker Support

Run Lembaranz in a container:

```bash
# Using Docker Compose
docker compose up -d

# Or build manually
docker build -t lembaranz .
docker run -it lembaranz
```

---

## 📚 Documentation

- [Beginner's Guide](docs/BEGINNERS_GUIDE.md) - Getting started
- [Codebase Guide](docs/CODEBASE_GUIDE.md) - Understanding the architecture
- [Recovery Phrase](docs/RECOVERY_PHRASE.md) - Backup and recovery
- [Strategy 2026](docs/STRATEGY_2026.md) - Roadmap and future plans

Additional documentation available in:
- [English Docs](docs/en/)
- [Indonesian Docs](docs/id/)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Guidelines
- Write code comments and documentation in **English**
- Use **Conventional Commits** for commit messages
- Follow the **Consolidated Flow**: Development on `testing` branch → merge to `serenity`

### Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand expected behavior.

---

## 🔒 Security

Security is paramount. See our [Security Policy](SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Audit procedures

**Report security issues responsibly** via GitHub Issues or email.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Abelion512/lembaranz/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Abelion512/lembaranz/discussions)
- **Documentation**: [docs/](docs/)

See [SUPPORT.md](SUPPORT.md) for detailed support options.

---

## 🙏 Acknowledgments

Built with:
- [Bun](https://bun.sh) - Fast JavaScript runtime
- [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) - Cryptographic primitives
- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [Commander](https://github.com/tj/commander.js) - CLI framework

---

**Version:** 1.0.2 | **Status:** Production Ready  
Made with ❤️ in Indonesia 🇮🇩

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Architecture](#-architecture)
- [Development](#️-development)
- [Docker Support](#-docker-support)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)
- [Support](#-support)

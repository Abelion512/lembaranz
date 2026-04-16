# Lembaranz
**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/@lembaranz/cli.svg)](https://www.npmjs.com/package/@lembaranz/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.

---

## Overview

Lembaranz is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for power users who live in the terminal, it encrypts everything locally using **AES-GCM 256-bit encryption** with **Argon2id (64MB Hardened)** key derivation.

### Key Principles

- **Local-First**: All data stays on your device. No cloud sync, no telemetry.
- **Atomic Persistence**: Write-to-temp-and-rename pattern prevents database corruption.
- **Zero-Knowledge**: Encryption happens before data touches storage.

---

## 🚀 Quick Start

### Installation

```bash
# General (CLI & Core)
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install
```

### Direct Execution
```bash
# Run the CLI directly
bun cli/src/main.ts setup
```

---

## ✨ Features

### 🔐 Security (Hardened)
- **AES-GCM 256-bit encryption** with hardware acceleration.
- **Argon2id (OWASP Hardened)**: 64MB memory cost for state-of-the-art brute-force resistance.
- **Atomic Writes**: Database integrity is protected against power loss or crashes.
- **Integrity hashing**: SHA-256 tamper detection on every entry.

### 💻 CLI Commands
```bash
lembaranz setup            # Interactive setup wizard
lembaranz launch           # TUI dashboard
lembaranz monitor          # System health & integrity
lembaranz security         # Security dashboard
```

---

## 📦 Architecture (Standalone)

```
├── packages/
│   ├── core/          # @lembaranz/core — Encryption & Storage engine
│   └── cli/           # @lembaranz/cli — Terminal interface & Commands
├── docs/              # Documentation (EN/ID)
├── README.md          # Project overview
└── SECURITY.md        # Security policy
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our standards.

- **English** for code comments and documentation.
- Use **Conventional Commits**.
- **Audit logic**: Every PR must pass `tsc --noEmit` on both components.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

**Version:** 1.0.1 | **Status:** Production Ready
Made with ❤️ in Indonesia 🇮🇩

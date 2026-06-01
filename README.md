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

### Installation

```bash
# Clone the repository
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install
```

### Execution
```bash
# Run the CLI directly
bun run cli setup
```

---

## ✨ Features

### 🔐 Security (Hardened)
- **AES-GCM 256-bit encryption** with optimized bitwise hex conversion.
- **Argon2id (OWASP Hardened)**: High-memory cost for state-of-the-art brute-force resistance.
- **Atomic Writes**: Database integrity is protected against power loss or crashes.
- **Integrity hashing**: SHA-256 tamper detection on every entry with metadata exclusion.

### 💻 CLI Commands
```bash
lembaranz setup     # Interactive setup wizard
lembaranz launch    # TUI dashboard
lembaranz browse    # Fast searchable archive browser
lembaranz monitor   # System health & integrity
lembaranz security  # Security dashboard & audits
lembaranz import    # Bulk credential import
lembaranz export    # Encrypted portable backup
```

---

## 📦 Architecture

```
├── packages/
│   ├── core/          # @lembaranz/core — Encryption & Storage engine
│   └── cli/           # lembaranz (unscoped package) — Terminal interface & Commands
├── docs/              # Documentation (EN)
├── README.md          # Project overview
└── SECURITY.md        # Security policy
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our standards.

- **English** for code comments and documentation.
- Use **Conventional Commits**.
- **Consolidated Flow**: Main development happens on the `testing` branch before being merged into the default `serenity` branch.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

**Version:** 1.0.2 | **Status:** Production Ready
Made with ❤️ in Indonesia 🇮🇩

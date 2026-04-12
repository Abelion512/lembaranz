# Lembaran

**Personal Digital Archive Vault** 🔐

[![Version](https://img.shields.io/npm/v/lembaran.svg)](https://www.npmjs.com/package/lembaran)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

![TUI Interface](docs/images/tui-mockup.png)

> **Data Sovereignty for Everyone.** Zero-knowledge encryption, premium CLI/TUI focus, no gimmicks. Own your words, secure your thoughts.

![Web Interface](docs/images/web-mockup.png)

---

## 🚀 Quick Start

### Installation (1 Line)

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

# Manage project environments
lembaran config
```

---

## ✨ Features

### 🔐 Vault (Security)
- **AES-GCM 256-bit encryption** (industry standard)
- **Argon2id key derivation** (anti-GPU cracking)
- **Auto-lock** after 1 minute of inactivity
- **Panic key** for emergency data wipe

### 📝 CLI Commands
```bash
lembaran launch    # Interactive TUI
lembaran write     # Create/edit notes
lembaran config    # Manage .env projects
lembaran import    # Import directories
lembaran search    # Search encrypted notes
lembaran export    # Export notes
```

### 🌐 Web (Landing & Docs)
- Informative landing page (lembaran.id)
- Comprehensive documentation (multi-language)
- Up-to-date changelog (Sync via CI/CD)
- **Focus: Showcase & Documentation** (Vault is purely CLI/TUI)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun 1.3+ |
| Language | TypeScript 5.x |
| Encryption | @noble/ciphers (AES-GCM) |
| CLI Framework | Ink (React for Terminal) |
| Web | Next.js 16, React 19, Tailwind CSS v4 |

---

## 📦 Monorepo Structure

```
lembaran/
├── packages/core    # Encryption logic & storage
├── packages/cli     # CLI commands & TUI
├── packages/web     # Landing page & documentation
├── docs/            # Full documentation
└── scripts/         # Helper scripts
```

---

## 🤝 Contributing

We welcome contributions from developers worldwide!

### Getting Started
1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/lembaran.git`
3. Install dependencies: `bun install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Commit changes: `git commit -m "feat: add amazing feature"`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Guidelines
- Use **English** for code comments and documentation
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Ensure all tests pass: `bun run lint && bun run test`
- Update documentation when adding new features

📖 **Full Documentation:** [docs/](docs/)

---

## 📄 License

Distributed under the [MIT License](LICENSE) — free to use, modify, and distribute.

---

## 👨‍💻 Development Team

**Lead Developer:**
Abelion Lavv ([@Abelion512](https://github.com/Abelion512))

**Contributors:**
Thank you to all open-source contributors! 🙏

---

## 📞 Contact & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/Abelion512/lembaran/issues)
- **Discussions:** [Q&A and general discussion](https://github.com/Abelion512/lembaran/discussions)
- **Email:** agen.salva@gmail.com

---

### 🚀 Automated Releases (CI/CD)

This project uses **Changesets** and **GitHub Actions** for automated version management.
1. Every Pull Request or Push to `main` is validated by `CI` (Lint & Build).
2. If `.changeset/*.md` files exist, GitHub Actions will automatically open a **"Version Packages"** Pull Request.
3. Once merged, the system automatically publishes packages to NPM under `@lembaranz`.

**Important**: You must add `NPM_TOKEN` (Automation type) to **GitHub Repo > Settings > Secrets and variables > Actions** for the publishing system to work.

---

**Version:** 3.5.0 | **Status:** Production Ready | **Focus:** CLI/TUI First

Made with ❤️ for data sovereignty

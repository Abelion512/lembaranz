# Lembaranz
**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.
>
> **Languages / 语言:** English (base) · 简体中文 (secondary). UI and docs are maintained in these two languages.

## Overview / 概述

Lembaranz is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for power users who live in the terminal, it encrypts everything locally using **AES-GCM 256-bit encryption** with **Argon2id (Hardened)** key derivation.

Lembaranz 是一个**自托管、零知识的凭证管理器**，让您完全控制自己的秘密。专为终端重度用户打造，使用**AES-GCM 256 位加密**和**Argon2id（强化）**密钥派生在本地加密所有内容。

### Key Principles / 核心原则

- **Local-First / 本地优先**: All data stays on your device. No cloud sync, no telemetry. / 所有数据保留在您的设备上。无云同步，无遥测。
- **Consolidated State / 整合状态**: Optimized for a single-branch (`main`) workflow with high-performance crypto logic. / 针对单分支（`main`）工作流优化，具有高性能加密逻辑。
- **Zero-Knowledge / 零知识**: Encryption happens before data touches storage. / 加密在数据存储之前进行。

---

## 🚀 Quick Start / 快速开始

### Installation / 安装

```bash
# Clone the repository / 克隆仓库
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install
```

### Execution / 运行
```bash
# Run the CLI directly / 直接运行 CLI
bun run cli setup
```

---

## ✨ Features / 功能特性

### 🔐 Security (Hardened) / 安全（强化）
- **AES-GCM 256-bit encryption** with optimized bitwise hex conversion. / **AES-GCM 256 位加密**，优化的按位十六进制转换。
- **Argon2id (OWASP Hardened)**: High-memory cost for state-of-the-art brute-force resistance. / **Argon2id（OWASP 强化）**：高内存成本，提供最先进的暴力破解抵抗能力。
- **Atomic Writes / 原子写入**: Database integrity is protected against power loss or crashes. / 数据库完整性受到保护，防止断电或崩溃。
- **Integrity hashing / 完整性哈希**: SHA-256 tamper detection on every entry with metadata exclusion. / 每个条目的 SHA-256 篡改检测，排除元数据。
- **Tamper-evident audit ledger / 防篡改审计账本**: Audit entries are hash-chained (blockchain-style, local only); `Audit.verifyChain()` exposes the first broken link, and `headHash()` can be anchored externally. / 审计条目以哈希链相连（本地，区块链式）；`verifyChain()` 可定位首个断链点，`headHash()` 可外部锚定。
- **Legacy KDF fallback / 旧版 KDF 回溯兼容**: Vaults and backups created with PBKDF2-HMAC-SHA-256 still unlock and are automatically re-wrapped with Argon2id. / 使用 PBKDF2-HMAC-SHA-256 创建的保险库与备份仍可解锁，并会自动改用 Argon2id 重新封装。

### 💻 CLI Commands / CLI 命令
```bash
lembaranz setup     # Interactive setup wizard / 交互式设置向导
lembaranz launch    # TUI dashboard / TUI 仪表板
lembaranz browse    # Fast searchable archive browser / 快速可搜索档案浏览器
lembaranz config    # Configuration manager (alias: cfg) / 配置管理
lembaranz doctor    # Diagnostics & health checks / 诊断与健康检查
lembaranz dashboard # Open the web dashboard / 打开网页控制台
lembaranz monitor   # System health & integrity / 系统健康和完整性
lembaranz security  # Security dashboard, audits & ledger status / 安全面板、审计与账本状态
lembaranz import    # Bulk credential import / 批量凭证导入
lembaranz export    # Encrypted portable backup / 加密便携式备份
```

---

## 📦 Architecture / 架构

```
├── packages/
│   ├── core/          # @lembaranz/core — Encryption, storage & audit ledger / 加密、存储与审计账本
│   ├── cli/           # @lembaranz/cli — Terminal interface & commands / 终端界面和命令
│   └── dashboard/     # @lembaranz/dashboard — Landing + web dashboard (Vite SPA, en/zh)
├── docs/              # Documentation (EN) / 文档（英文）
├── README.md          # Project overview / 项目概述
└── SECURITY.md        # Security policy / 安全策略
```

---

## 🤝 Contributing / 贡献

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our standards.

我们欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解我们的标准。

- **English** for code comments and documentation. / 代码注释和文档使用**英文**。
- Use **Conventional Commits**. / 使用**约定式提交**。
- **Consolidated Flow / 整合流程**: All development happens on feature branches merged into `main` (the default branch); CI/CD workflows, scans and releases run on `main`. / 所有开发都在功能分支上进行并合并到默认分支 `main`；CI/CD 工作流、安全扫描和发布都在 `main` 上运行。

---

## 📄 License / 许可证

Distributed under the [MIT License](LICENSE). / 根据 [MIT 许可证](LICENSE) 分发。

---

**Version / 版本:** 0.2.0 (`@lembaranz/core`, `@lembaranz/cli`) | **Status / 状态:** Production Ready / 生产就绪
Made with ❤️ in Indonesia 🇮🇩 / 在印度尼西亚用心制作

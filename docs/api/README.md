**Lembaranz Documentation v0.0.0**

***

# Lembaranz
**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/lembaranz.svg)](https://www.npmjs.com/package/lembaranz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.

## Overview / 概述

Lembaranz is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for power users who live in the terminal, it encrypts everything locally using **AES-GCM 256-bit encryption** with **Argon2id (Hardened)** key derivation.

Lembaranz 是一个**自托管、零知识的凭证管理器**，让您完全控制自己的秘密。专为终端重度用户打造，使用**AES-GCM 256 位加密**和**Argon2id（强化）**密钥派生在本地加密所有内容。

### Key Principles / 核心原则

- **Local-First / 本地优先**: All data stays on your device. No cloud sync, no telemetry. / 所有数据保留在您的设备上。无云同步，无遥测。
- **Consolidated State / 整合状态**: Optimized for a single-branch (`testing`) workflow with high-performance crypto logic. / 针对单分支（`testing`）工作流优化，具有高性能加密逻辑。
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

### 💻 CLI Commands / CLI 命令
```bash
lembaranz setup     # Interactive setup wizard / 交互式设置向导
lembaranz launch    # TUI dashboard / TUI 仪表板
lembaranz browse    # Fast searchable archive browser / 快速可搜索档案浏览器
lembaranz monitor   # System health & integrity / 系统健康和完整性
lembaranz security  # Security dashboard & audits / 安全仪表板和审计
lembaranz import    # Bulk credential import / 批量凭证导入
lembaranz export    # Encrypted portable backup / 加密便携式备份
```

---

## 📦 Architecture / 架构

```
├── packages/
│   ├── core/          # @lembaranz/core — Encryption & Storage engine / 加密和存储引擎
│   └── cli/           # lembaranz (unscoped package) — Terminal interface & Commands / 终端界面和命令
├── docs/              # Documentation (EN) / 文档（英文）
├── README.md          # Project overview / 项目概述
└── SECURITY.md        # Security policy / 安全策略
```

---

## 🤝 Contributing / 贡献

We welcome contributions! Please see [CONTRIBUTING.md](_media/CONTRIBUTING.md) for our standards.

我们欢迎贡献！请参阅 [CONTRIBUTING.md](_media/CONTRIBUTING.md) 了解我们的标准。

- **English** for code comments and documentation. / 代码注释和文档使用**英文**。
- Use **Conventional Commits**. / 使用**约定式提交**。
- **Consolidated Flow / 整合流程**: Main development happens on the `testing` branch before being merged into the default `serenity` branch. / 主要开发在 `testing` 分支上进行，然后合并到默认的 `serenity` 分支。

---

## 📄 License / 许可证

Distributed under the [MIT License](_media/LICENSE). / 根据 [MIT 许可证](_media/LICENSE) 分发。

---

**Version / 版本:** 1.0.2 | **Status / 状态:** Production Ready / 生产就绪
Made with ❤️ in Indonesia 🇮🇩 / 在印度尼西亚用心制作

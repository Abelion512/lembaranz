# Lembaranz
**Self-Hosted Credential Manager** 🔐

[![Version](https://img.shields.io/npm/v/lembaranz.svg)](https://www.npmjs.com/package/lembaranz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Your credentials belong to you.** Zero-knowledge encryption, local-first, no cloud dependencies.

---

## English Version

### Overview

Lembaranz is a **self-hosted, zero-knowledge credential manager** that gives you complete control over your secrets. Built for power users who live in the terminal, it encrypts everything locally using **AES-GCM 256-bit encryption** with **Argon2id (Hardened)** key derivation.

#### Key Principles

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

- Use **English** for code comments and documentation.
- Use **Conventional Commits**.
- **Consolidated Flow**: Main development happens on the `testing` branch before being merged into the default `serenity` branch.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

**Version:** 1.0.2 | **Status:** Production Ready

Made with ❤️ in Indonesia 🇮🇩

---

## 中文版本 (Chinese Simplified)

### 概述

Lembaranz 是一个**自托管、零知识的凭证管理器**，让您完全控制自己的机密信息。专为终端用户设计，使用 **AES-GCM 256 位加密**和 **Argon2id（强化版）**密钥派生算法在本地加密所有数据。

#### 核心原则

- **本地优先**：所有数据都保存在您的设备上。无云同步，无遥测。
- **整合状态**：针对单分支（`testing`）工作流进行优化，具有高性能加密逻辑。
- **零知识**：加密在数据接触存储之前完成。

---

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install
```

### 运行
```bash
# 直接运行 CLI
bun run cli setup
```

---

## ✨ 功能特性

### 🔐 安全性（强化版）
- **AES-GCM 256 位加密**，采用优化的按位十六进制转换。
- **Argon2id（OWASP 强化版）**：高内存成本，提供最先进的暴力破解防护。
- **原子写入**：数据库完整性受到保护，防止断电或崩溃。
- **完整性哈希**：每个条目都有 SHA-256 防篡改检测，排除元数据。

### 💻 CLI 命令
```bash
lembaranz setup     # 交互式设置向导
lembaranz launch    # TUI 仪表板
lembaranz browse    # 快速可搜索的归档浏览器
lembaranz monitor   # 系统健康和完整性检查
lembaranz security  # 安全仪表板和审计
lembaranz import    # 批量凭证导入
lembaranz export    # 加密便携备份
```

---

## 📦 架构

```
├── packages/
│   ├── core/          # @lembaranz/core — 加密和存储引擎
│   └── cli/           # lembaranz（无作用域包）— 终端界面和命令
├── docs/              # 文档（英文）
├── README.md          # 项目概述
└── SECURITY.md        # 安全策略
```

---

## 🤝 贡献

我们欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解我们的标准。

- 代码注释和文档使用**英语**。
- 使用**约定式提交**（Conventional Commits）。
- **整合流程**：主要开发在 `testing` 分支上进行，然后合并到默认的 `serenity` 分支。

---

## 📄 许可证

根据 [MIT 许可证](LICENSE) 分发。

---

**版本：** 1.0.2 | **状态：** 生产就绪

用 ❤️ 在印度尼西亚制作 🇮🇩

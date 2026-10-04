# Lembaranz
**A local vault for long-lived secrets** 🔐

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-orange.svg)](SECURITY.md)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3-fbefdb)](https://bun.sh)

> **Passwords are becoming passkeys. Secrets are not.**
> API keys, `.env` files, recovery codes, 2FA seeds, private keys. Encrypted on
> your machine, where no company can read it and no company can lose it.
>
> **Languages / 语言:** English (base) · 简体中文 (secondary). UI and docs are maintained in these two languages.

## Overview / 概述

Lembaranz is a **local-first, zero-knowledge vault** for the credentials that
outlive a login. It is deliberately **not** a password manager: it does not
autofill, it does not sync, and it has no accounts. What it holds is the material
a login form cannot express — whole configuration files, API keys with no
username field, and the recovery codes you cannot re-issue.

Lembaranz 是一个**本地优先、零知识的保险库**，用于存放那些比登录更长效的凭据。它刻意**不是**密码管理器：不自动填充、不同步、没有账号。它真正保存的是登录表单无法表达的内容——完整配置文件、没有用户名字段的API 密钥，以及无法重新签发的恢复码。

> **Why not Bitwarden, 1Password, or Proton Pass?** They are good products solving
> a shrinking problem, and they solve it better than this will. They store your
> data in a company's cloud (or ask you to run their server). This stores it in
> one process on your machine and gives you a hash-chained audit ledger the UI
> re-verifies live. Full architectural comparison and the expansion path:
> [`docs/STRATEGY_2026.md`](docs/STRATEGY_2026.md).

### Key Principles / 核心原则

- **Local-First / 本地优先**: All data stays on your device. No cloud sync, no telemetry. / 所有数据保留在您的设备上。无云同步，无遥测。
- **Zero-Knowledge / 零知识**: Encryption happens before data touches storage, and the key never leaves the server process. / 加密在数据存储之前进行，密钥永不离开服务进程。
- **Verifiable / 可验证**: Every entry carries a SHA-256 seal and every action is hash-chained, so a silent edit is detectable rather than merely unlikely. / 每条记录带有 SHA-256 封印，每个操作都哈希成链，静默修改可被发现而不仅仅是“不太可能”。

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
lembaranz setup     # Interactive setup wizard (alias: init) / 交互式设置向导
lembaranz launch    # TUI dashboard / TUI 仪表板
lembaranz browse    # Fast searchable archive browser / 快速可搜索档案浏览器
lembaranz config    # Configuration manager (alias: cfg) / 配置管理
lembaranz run       # Load a .env profile from the vault, then run a command / 从保险库加载环境后执行命令
lembaranz doctor    # Diagnostics & health checks / 诊断与健康检查
lembaranz dashboard # Open the web dashboard / 打开网页控制台
lembaranz monitor   # System health & integrity / 系统健康和完整性
lembaranz security  # Security dashboard, audits & ledger status / 安全面板、审计与账本状态
lembaranz import    # Bulk credential import / 批量凭证导入
lembaranz export    # Encrypted portable backup / 加密便携式备份
lembaranz server    # Local vault server for the web UI / 网页控制台的本地保险库服务
```

Every command above is asserted against the real Commander registration by
`packages/cli/src/__tests__/commands.test.ts`, so this list cannot drift from the
binary without failing CI. Full reference: [`docs/en/cli.md`](docs/en/cli.md).

### 🌐 Web UI / 网页控制台

The web dashboard talks to a local server that holds the master key, so the
browser never receives it. The server prints a link that opens the dashboard
already connected, so there is no address or token to copy by hand:

```bash
lembaranz server                  # prints the address, token, and a connect link
lembaranz server --open           # ...and opens that link in your browser
lembaranz server --port 5199      # or let LEMBARANZ_PORT / LEMBARANZ_HOST do it
```

The token rides in the URL fragment, which browsers never send to a server and
never place in a `Referer` header. The dashboard strips it on first render, so it
does not linger in session history either. If you would rather paste it yourself,
`/app` still has a connect form.

The server binds to loopback only. `lembaranz server --host 0.0.0.0` exposes it
to your network and prints a warning, because anyone who can reach the port can
read the vault once it is unlocked.

网页控制台连接本地服务，密钥只存在于服务进程中，不进入浏览器。服务会打印一个已连接好的链接，无需手动复制地址和令牌：

```bash
lembaranz server                  # 打印地址、令牌和连接链接
lembaranz server --open           # 直接在浏览器中打开该链接
```

令牌位于 URL 的 fragment 部分，浏览器不会将其发送给服务器，也不会写入 `Referer` 头。控制台会在首次渲染时将其清除，因此也不会残留在会话历史中。

服务默认只监听本机。`--host 0.0.0.0` 会将其暴露到网络并打印警告，因为任何能访问该端口的人都可以在解锁后读取保险库。

---

## 📦 Architecture / 架构

```
├── packages/
│   ├── core/          # @lembaranz/core — Encryption, storage & audit ledger / 加密、存储与审计账本
│   ├── cli/           # @lembaranz/cli — Terminal interface & commands / 终端界面和命令
│   └── dashboard/     # @lembaranz/dashboard — Landing + web dashboard (Vite SPA, en/zh)
├── docs/              # Documentation (EN) / 文档（英文）
│   ├── REPOSITORY_MAP.md   # Every file and folder, indexed
│   ├── CODEBASE_GUIDE.md   # How the code works
│   └── RECOVERY_PHRASE.md  # 12-word recovery phrase
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

**Version / 版本:** 0.2.0 (`@lembaranz/core`, `@lembaranz/cli`) | **Status / 状态:** Pre-1.0, actively hardening / 1.0 之前，持续加固中

Not published to npm yet, and not audited by a third party yet. What is
demonstrated today is in [`SECURITY.md`](SECURITY.md); what is not yet proven is
tracked in `docs/STRATEGY_2026.md`. / 尚未发布到 npm，尚未经过第三方审计。
Made with ❤️ in Indonesia 🇮🇩 / 在印度尼西亚用心制作

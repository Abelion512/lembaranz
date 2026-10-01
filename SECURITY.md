# Security Policy

**Last Updated: September 30, 2026**

## Supported Versions

| Version | Supported          | Security Focus                          |
| ------- | ------------------ | --------------------------------------- |
| 1.0.x   | :white_check_mark: | AES-GCM 256, Argon2id (t=2, m=64 MiB)   |

## Overview

Lembaranz is a local-first, zero-knowledge vault for notes and credentials that runs in your terminal, TUI, or browser. There is **no cloud telemetry, no automated external backups, and no centralized managed keys**. The security of your vault relies entirely on the strength of your master password and the integrity of your local system.

## Cryptographic Design (current implementation)

### Encryption

- **AES-GCM 256-bit** with a random 12-byte IV for every operation.
- Each vault has a random **master key**; all entries (title, content, preview, credentials) are encrypted with it.

### Key Derivation

- **Argon2id** (default): `t=2`, `m=65536` KiB (64 MiB), `p=1`, 32-byte output, 16-byte random salts. Implemented in `packages/core/src/Vault.ts` (`deriveKey`).
- **Legacy compatibility**: vaults and portable backups created while PBKDF2-HMAC-SHA-256 (100 000 iterations) was the active KDF unlock through an automatic fallback (`deriveKeyLegacy`). After a successful legacy unlock, the master key is re-wrapped with Argon2id (audit entry `KDF_UPGRADED`). Note ciphertext is never re-encrypted during migration.

### Integrity & Tamper Evidence

- Every entry carries a **SHA-256 integrity seal**; silent modifications are detected on open (`packages/core/src/Integrity.ts`).
- The audit trail is a **hash-chained ledger** (blockchain-style, local only): each entry commits to the previous entry's hash, so editing, reordering, or removing a covered entry breaks verification (`Audit.verifyChain()` in `packages/core/src/Audit.ts`).
- `Audit.headHash()` exposes the chain head. Record it externally if you also want truncation detection — a purely local chain can prove tamper-evidence but cannot see the future of its own tail.

### Storage

- Web: IndexedDB. CLI: JSON file with `0o600` permissions inside a `0o700` directory, written atomically.
- **Panic key**: one emergency passphrase permanently wipes all vault data.

## Reporting a Vulnerability

We take the security of Lembaranz seriously. If you have discovered a vulnerability, please responsibly disclose it.

**Do NOT report security vulnerabilities via public GitHub issues.**

### How to Report

**Preferred:** open a private advisory at https://github.com/Abelion512/lembaranz/security/advisories/new
**Email:** agen.salva@gmail.com
**Expected Response Time:** Within 48 hours
**Preferred Language:** English (Simplified Chinese accepted)

### What to Include

1. **Description** — clear explanation of the vulnerability
2. **Steps to Reproduce** — detailed reproduction steps
3. **Impact Assessment** — what could an attacker achieve?
4. **Environment** — OS, Bun/Node version, and CLI/dashboard version

## Scope

We are particularly interested in reports related to:

- **Cryptographic weaknesses** in the AES-GCM, Argon2id, or legacy PBKDF2 fallback paths
- **Key management flaws** — master key exposure or bypasses
- **Ledger bypasses** — silently editing, reordering, or removing audit entries without breaking verification
- **Data exposure** — unencrypted data leaking into logs, swap space, or IPC channels
- **Arbitrary code execution** — via maliciously crafted portable backups
- **Privilege escalation** — within the local TUI or the local dev dashboard server

## Out of Scope

- Social engineering attacks
- Physical access attacks (e.g., evil maid attacks, cold boot memory extraction)
- Attacks requiring root/admin access to the host system
- Issues in underlying runtimes (Bun/Node.js) unless exacerbated by our implementation

---

*Stay Secure. Stay Local.*

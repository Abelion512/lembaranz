# Security Policy

## Supported Versions

| Version | Supported          | Security Focus                     |
| ------- | ------------------ | ---------------------------------- |
| 1.0.x   | :white_check_mark: | AES-GCM 256, Argon2id (m:65536)    |

## Overview

Lembaranz is a local-first, zero-knowledge credential manager that operates natively in your terminal. There is **no cloud telemetry, no automated external backups, and no centralized managed keys**. The security of your vault relies entirely on the strength of your master password and the integrity of your local system.

For a comprehensive overview of our cryptographic architecture, threat model, and recent security advisories, please visit our [Security Portal](https://lembaranz.sh/security).

## Reporting a Vulnerability

We take the security of Lembaranz seriously. If you have discovered a vulnerability, please responsibly disclose it.

**Do NOT report security vulnerabilities via public GitHub issues.**

### How to Report

**Email:** security@lembaranz.sh (or agen.salva@gmail.com)
**Expected Response Time:** Within 48 hours
**Preferred Language:** English or Indonesian

### What to Include

1. **Description** - Clear explanation of the vulnerability
2. **Steps to Reproduce** - Detailed reproduction steps
3. **Impact Assessment** - What could an attacker achieve?
4. **Environment** - OS, Node/Bun version, and CLI version

## Scope

We are particularly interested in reports related to:
- **Cryptographic weaknesses** in our AES-GCM or Argon2id implementation
- **Key management flaws** - Master key exposure or bypasses
- **Data exposure** - Unencrypted data leaking into logs, swap space, or IPC channels
- **Arbitrary Code Execution** - Via maliciously crafted portable backups
- **Privilege Escalation** - Within the context of the local TUI or local web daemon

## Out of Scope

- Social engineering attacks
- Physical access attacks (e.g., evil maid attacks, cold boot memory extraction)
- Attacks requiring root/admin access to the host system
- Issues in underlying runtimes (Bun/Node.js) unless exacerbated by our implementation

---

*Stay Secure. Stay Local.*

# Security Policy

**Last Updated: September 30, 2026**

## Supported Versions

| Version | Supported          | Security Focus                          |
| ------- | ------------------ | --------------------------------------- |
| 0.2.x   | :white_check_mark: | AES-GCM 256, Argon2id (t=2, m=64 MiB)   |

> The published packages are at **0.2.0**. The `1.0.x` entries in `CHANGELOG.md`
> predate the `0.x` reset and are not released artifacts.

## Overview

Lembaranz is a local-first, zero-knowledge vault for notes and credentials that runs in your terminal, TUI, or browser. There is **no cloud telemetry, no automated external backups, and no centralized managed keys**. The security of your vault relies entirely on the strength of your master password and the integrity of your local system.

## Trust boundary: the local server

The web UI no longer holds the master key. `lembaranz server` starts a local
HTTP server that holds the key in memory, and the browser tab holds only a
bearer token minted at startup. This is an improvement over the previous
browser-side design, where a compromised tab or extension could read the vault
straight out of IndexedDB.

What the server guarantees:

- **Loopback by default.** It binds `127.0.0.1`. `--host 0.0.0.0` opts into LAN
  exposure and prints a warning, because anyone who can reach the port can read
  the vault once it is unlocked.
- **One bearer token per process**, printed at startup. It is not persisted, so
  restarting the server invalidates every open tab. A tab stores it in
  `sessionStorage`, so closing the tab ends the session.
- **No HTTP caching.** Every response sets `Cache-Control: no-store`, so vault
  data never lands in a shared or on-disk cache.
- **Token in a header, not a cookie**, so the API needs no credentialed CORS and
  a cross-site page cannot ride an ambient session.

Known limits, stated plainly:

- The token is not scoped per user and does not expire on its own. It is a
  loopback single-user design, not an authentication system. Do not bind this
  to a public interface.
- There is no transport encryption. Loopback traffic is not observable by a
  network attacker, but anything else needs TLS in front of it.

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
- The file is written temp-then-rename, which prevents a torn write. It is **not** `fsync`-ed, so a power loss during the rename window can lose the most recent write. This is a known limitation and is not claimed otherwise anywhere in the docs.

### What a store writer can and cannot do

Someone who can write the vault file directly, bypassing the app, is outside the
threat model for confidentiality: they cannot read ciphertext without the
master key. They can, however, attempt to make the app *display* something it
should not. Two properties close that path:

- **A field that is not in packed form is not ciphertext.** `decryptPacked`
  returns any string without a `|` separator unchanged, for entries written
  before encryption existed. A title replaced with bare plaintext would
  therefore decrypt "successfully". `Vault.isPacked` distinguishes the two, and
  `getAllNotes` and `decryptNote` render `⚠️ [UNSEALED]` and log a
  `SECURITY_ALERT` rather than showing the value. Entries written by
  `saveNote` are always packed, so this never fires on legitimate data.
- **Non-hex input is rejected.** A tampered IV segment used to decode to
  different bytes instead of failing, because the nibble conversion is only
  valid on `[0-9a-f]` and other characters collide onto valid values.

The per-entry SHA-256 seal covers the sealed fields, and a mismatch is surfaced
in the note body. The ledger chain is a separate, stronger guarantee: editing
or removing a covered entry breaks `Audit.verifyChain()`.

Rate limiting is **in-process**, held in memory, and enforced **inside
`Archive.unlockVault` itself** so every caller is covered. This matters: while
the check lived only in the CLI's `openVaultCLI`, `lembaranz server` calling
`unlockVault` directly was an unthrottled password oracle (measured 12 wrong
passwords, 12 Argon2id derivations, no lockout). Buckets are scoped per vault,
so failing to unlock `personal` does not lock you out of `project`.

Restarting the process clears the counters. That is a deliberate trade for a
single-user local tool: the lockout deters casual guessing, not a determined
attacker who can restart the server or read the vault file directly.

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
- **Integrity bypasses** — causing the app to display or trust a value that was never sealed, or defeating the entry seal or the audit chain
- **Data loss** — any input that makes a legitimate write fail silently, including concurrent operations against a cold store
- **Arbitrary code execution** — via maliciously crafted portable backups
- **Privilege escalation** — within the local TUI or the local dev dashboard server

## Out of Scope

- Social engineering attacks
- Physical access attacks (e.g., evil maid attacks, cold boot memory extraction)
- Attacks requiring root/admin access to the host system
- Issues in underlying runtimes (Bun/Node.js) unless exacerbated by our implementation

---

*Stay Secure. Stay Local.*

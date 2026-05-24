# @lembaranzz/core

**The Sovereign Encryption Engine**

`@lembaranzz/core` is the cryptographic heart of the Lembaranzz ecosystem. It provides high-level abstractions for zero-knowledge data protection, local-first storage, and tamper-proof data integrity.

## 🔐 Cryptographic Architecture

Lembaranzz employs industry-standard authenticated encryption and high-cost key derivation to ensure data privacy without ever touching the cloud.

### 1. Key Derivation (Argon2id)
We use the **Argon2id** algorithm (provided by `@noble/hashes`) to derive encryption keys from user passwords. This ensures extreme resistance to GPU and ASIC-based brute-force attacks.

- **Type**: Argon2id
- **Memory Cost**: 64 MB
- **Iterations**: 3
- **Parallelism**: 1
- **Salt**: 128-bit random salt stored per-vault.

### 2. Authenticated Encryption (AES-GCM 256)
All data is encrypted using **AES-256-GCM** (Galois/Counter Mode) via the `@noble/ciphers` library.

- **Algorithm**: AES-GCM 256-bit
- **Nonce**: 96-bit unique random nonce per item.
- **Authentication**: Built-in integrity tag verification ensures data has not been tampered with or corrupted.

### 3. Deterministic Integrity Seals
To prevent "Seal Broken" errors caused by object property reordering, the `Integrity` service implements **Recursive Canonical Serialization**.

- Objects keys are sorted alphabetically before hashing.
- Hash Algorithm: SHA-256.

## 🚀 Usage

```typescript
import { Archive, Sentinel, Integrity } from '@lembaranzz/core';

// 1. Initialize a vault
const archive = await Archive.createVault('master-password');

// 2. Encrypt and Save
await archive.saveNote({
  title: 'Secret Plan',
  content: '...'
});

// 3. Constant-time comparison (Timing attack protection)
const isValid = Sentinel.constantTimeCompare(inputHash, storedHash);
```

## 🛡️ Security Hardening

- **Timing Attack Mitigation**: `constantTimeCompare` iterates through full buffer lengths to prevent data leaks via timing.
- **Node.js Local Security**: Automatically applies `600` permissions (owner-only) to sensitive archive files on disk.
- **Zero-Knowledge**: Master passwords and derived keys are never persisted.

## 📄 License
MIT

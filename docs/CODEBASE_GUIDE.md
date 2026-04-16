# 🧭 Lembaranz Codebase Exploration Guide

> **For Developers** — Understanding how Lembaranz works under the hood

---

## 📦 Package Structure

```
lembaranz/ (Monorepo)
├── packages/
│   ├── core/          # @lembaranz/core — The encryption engine
│   ├── cli/           # @lembaranz/cli — Terminal interface (TUI)
│   └── web/           # @lembaranz/web — Local-only web UI (DO NOT DEPLOY)
```

---

## 🔐 Core Package (`@lembaranz/core`)

This is the **heart** of Lembaranz — all encryption happens here.

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| **`Vault.ts`** | Encryption/decryption engine (AES-GCM + Argon2id) | ~200 |
| **`Archive.ts`** | High-level credential management (CRUD operations) | ~570 |
| **`Storage.ts`** | Abstract storage interface (filesystem/IndexedDB) | ~100 |
| **`Password.ts`** | Mnemonic generation & BIP39 wordlist | ~255 |
| **`Sentinel.ts`** | Security utilities (rate limiting, constant-time compare) | ~150 |
| **`Integrity.ts`** | SHA-256 hash verification (tamper detection) | ~80 |
| **`Context.ts`** | Environment variable management | ~120 |
| **`AuditLog.ts`** | Access logging (who accessed what when) | ~90 |

---

## 🔍 How Encryption Works (Step-by-Step)

### 1. **Vault Setup** (First Time)

**File**: `Archive.ts` → `setupVault()`

```typescript
// User enters: password = "mySecret123"
await Archive.setupVault("mySecret123", mnemonic);
```

**What happens:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Generate Master Key (random 256-bit)                 │
│    └─> crypto.getRandomValues(new Uint8Array(32))       │
│                                                         │
│ 2. Derive Key from Password                             │
│    └─> Argon2id(password, salt) → PasswordKey           │
│                                                         │
│ 3. Wrap Master Key with PasswordKey                     │
│    └─> AES-GCM(MasterKey, PasswordKey) → wrapped        │
│                                                         │
│ 4. Derive Key from Mnemonic (separate path)             │
│    └─> Argon2id(mnemonic, recoverySalt) → RecoveryKey   │
│                                                         │
│ 5. Wrap Master Key with RecoveryKey                     │
│    └─> AES-GCM(MasterKey, RecoveryKey) → recoveryWrap   │
│                                                         │
│ 6. Store metadata                                       │
│    └─> auth_salt, auth_wrapped_key                      │
│    └─> recovery_salt, recovery_wrapped_key              │
└─────────────────────────────────────────────────────────┘
```

**Result**: Two independent ways to unlock the same Master Key!

---

### 2. **Vault Unlock** (Normal Login)

**File**: `Archive.ts` → `unlockVault()`

```typescript
const success = await Archive.unlockVault("mySecret123");
```

**Flow:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Retrieve metadata from storage                       │
│    └─> auth_salt, auth_wrapped_key                      │
│                                                         │
│ 2. Derive key from password                             │
│    └─> Argon2id(password, auth_salt) → PasswordKey      │
│                                                         │
│ 3. Decrypt wrapped master key                           │
│    └─> AES-GCM-decrypt(auth_wrapped_key, PasswordKey)   │
│                                                         │
│ 4. Set as active key                                    │
│    └─> Vault.setActiveKey(masterKey)                    │
│                                                         │
│ 5. ✅ Vault unlocked!                                   │
└─────────────────────────────────────────────────────────┘
```

---

### 3. **Credential Storage**

**File**: `Archive.ts` → `saveNote()`

```typescript
await Archive.saveNote({
  title: "API Key - OpenAI",
  content: "sk-proj-abc123...",
  tags: ["api", "openai"]
});
```

**What happens:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Get active master key (must be unlocked first)       │
│    └─> Vault.getActiveKey()                             │
│                                                         │
│ 2. Encrypt each field separately                        │
│    └─> AES-GCM(title) → encryptedTitle                  │
│    └─> AES-GCM(content) → encryptedContent              │
│    └─> AES-GCM(tags) → encryptedTags                    │
│                                                         │
│ 3. Compute integrity hash                               │
│    └─> SHA-256(encryptedContent) → seal                 │
│                                                         │
│ 4. Store encrypted blob                                 │
│    └─> Storage.set('notes', id, encryptedBlob)          │
└─────────────────────────────────────────────────────────┘
```

---

### 4. **Credential Retrieval**

**File**: `Archive.ts` → `getNoteById()`

```typescript
const note = await Archive.getNoteById("abc123");
```

**Flow:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Retrieve encrypted blob from storage                 │
│    └─> Storage.get('notes', id)                         │
│                                                         │
│ 2. Verify integrity (tamper check)                      │
│    └─> SHA-256(encryptedContent) === stored_seal?       │
│    └─> ❌ If mismatch → TAMPER DETECTED!                │
│                                                         │
│ 3. Decrypt with master key                              │
│    └─> AES-GCM-decrypt(encryptedContent, masterKey)     │
│                                                         │
│ 4. Return plaintext                                     │
│    └─> { title: "API Key - OpenAI",                     │
│           content: "sk-proj-abc123..." }                │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 12-Word Recovery Phrase

**File**: `Password.ts`

### Generation

```typescript
// 12 words × 11 bits per word = 132 bits entropy
const mnemonic = generateMnemonic(12);
// => "abandon ability able about above absent absorb..."
```

**Word List**: 2048 words (BIP39 standard)

**Entropy Comparison:**
- 12 words: **132 bits** (≈ 5.4 × 10³⁹ combinations)
- AES-128: 128 bits
- Bitcoin BIP39: 128-256 bits

### Recovery

**File**: `Archive.ts` → `recoverVault()`

```typescript
// Forgot password? Use mnemonic!
await Archive.recoverVault("abandon ability able about...");

// Then force set new password
await Archive.resetPassword("newPassword456");
```

**See**: `docs/RECOVERY_PHRASE.md` for full documentation

---

## 🖥️ CLI Package (`@lembaranz/cli`)

### Structure

```
packages/cli/src/
├── main.ts              # Entry point (Commander.js setup)
├── utils.ts             # Helper functions
├── commands/            # CLI commands
│   ├── Config.ts        # `lembaranz config save/load/list`
│   ├── Settings.ts      # `lembaranz settings` (env vars + git hooks)
│   ├── Import.ts        # `lembaranz import` (restore backups)
│   ├── Export.ts        # `lembaranz export` (portable backup)
│   ├── Monitor.ts       # `lembaranz monitor` (system health)
│   ├── Security.ts      # `lembaranz security` (security dashboard)
│   ├── Browse.ts        # `lembaranz browse` (search credentials)
│   └── Launch.ts        # `lembaranz launch` (TUI)
└── tui/                 # Terminal UI components (Ink/React)
    ├── UnlockVaultScreen.tsx
    ├── MainScreen.tsx
    └── ...
```

### Command Flow

```
User types: lembaranz config save myproject
                    ↓
main.ts registers all commands
                    ↓
Config.ts → configCmd.command('save')
                    ↓
prepareContext() → load vault config
                    ↓
openVaultCLI() → prompt for password
                    ↓
Archive.getAllNotes() → read vault
                    ↓
Save .env to vault with tag "myproject"
```

---

## 🌐 Web Package (`@lembaranz/web`)

### ⚠️ WARNING: LOCAL TESTING ONLY

**Why not deploy?**
- Credentials decrypted in browser memory
- Vulnerable to network attacks if exposed
- Designed for development/testing only

### Structure

```
packages/web/
├── app/[locale]/        # Next.js 16 App Router
│   ├── layout.tsx       # i18n + SEO metadata
│   ├── page.tsx         # Landing page
│   └── ...
├── components/          # React components
│   ├── landing/         # Landing page sections
│   └── shared/          # Shared utilities
├── gaya/                # Tailwind CSS styles
├── i18n/                # Internationalization setup
└── messages/            # Translation files (id.json, en.json)
```

### Safe Usage

```bash
# ✅ DO: Run locally
bun run dev
# => http://localhost:1400

# ❌ DON'T: Deploy to Vercel/Netlify/etc.
```

---

## 🔬 Testing the Codebase

### Run All Tests

```bash
bun test
```

**Coverage:**
- ✅ 64 tests passing
- ✅ Core encryption tests
- ✅ Mnemonic generation/validation
- ✅ Security utilities (rate limiting, constant-time compare)
- ✅ Web component tests (XSS prevention, path traversal)

### Stress Test

```bash
bun run test:perf
# => Tests with 1000 credentials
```

### Specific Package

```bash
bun test packages/core  # Core encryption
bun test packages/web   # Web components
```

---

## 🛠️ Common Development Tasks

### 1. **Add New CLI Command**

```typescript
// packages/cli/src/commands/MyCommand.ts
import { Command } from 'commander';
import { Archive } from '@lembaranz/core';
import { prepareContext, openVaultCLI } from '../utils.js';

export function registerMyCommand(program: Command) {
  program
    .command('mycommand')
    .description('Does something useful')
    .action(async () => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return;
      
      // Your logic here
      console.log('Hello from my command!');
    });
}
```

Then register in `main.ts`:
```typescript
import { registerMyCommand } from './commands/MyCommand.js';
registerMyCommand(program);
```

### 2. **Add New Encryption Feature**

Edit `Vault.ts`:
```typescript
// Example: Add custom encryption method
export const Vault = {
  // ... existing methods
  
  async myCustomEncrypt(data: string): Promise<string> {
    const key = this.getActiveKey();
    // Your encryption logic
    return encrypted;
  }
};
```

### 3. **Update Storage Backend**

Edit `Storage.ts`:
```typescript
// Example: Add SQLite backend
export const Storage = {
  // ... existing methods
  
  async setSQLite(table: string, key: string, value: string) {
    // SQLite implementation
  }
};
```

---

## 🔐 Security Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   CLI/TUI    │  │   Web (Dev)  │  │   REST API   │     │
│  │  (Primary)   │  │  (Local)     │  │  (Future?)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   @lembaranz/core                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Archive.ts (High-Level)              │   │
│  │  - CRUD operations                                │   │
│  │  - Vault setup/recovery                           │   │
│  │  - Integrity checks                               │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              Vault.ts (Encryption)                │   │
│  │  - AES-GCM 256-bit encryption                     │   │
│  │  - Argon2id key derivation                        │   │
│  │  - Key wrapping/unwrapping                        │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │           Password.ts (Mnemonic)                  │   │
│  │  - BIP39 wordlist (2048 words)                    │   │
│  │  - 12-word recovery phrase generation             │   │
│  │  - Validation (checks word membership)            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Sentinel.ts (Security)                  │   │
│  │  - Rate limiting (5 attempts max)                 │   │
│  │  - Constant-time string comparison                │   │
│  │  - Panic key detection                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Integrity.ts (Tamper Detection)          │   │
│  │  - SHA-256 hash verification                      │   │
│  │  - Digital seal validation                        │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Storage Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Filesystem │  │ IndexedDB  │  │  SQLite?   │        │
│  │  (CLI)     │  │  (Web)     │  │ (Future)   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Further Reading

1. **RECOVERY_PHRASE.md** — Deep dive into 12-word mnemonic
2. **PRD.md** — Product requirements & roadmap
3. **SECURITY.md** — Security policy & responsible disclosure
4. **AGENTS.md** — Development guidelines for AI agents

---

## 🎓 Learning Path

### Beginner (1-2 hours)
- [ ] Read README.md
- [ ] Run `bun test` to see tests pass
- [ ] Try CLI commands: `lembaranz --help`
- [ ] Read `docs/RECOVERY_PHRASE.md`

### Intermediate (3-5 hours)
- [ ] Read `Vault.ts` encryption logic
- [ ] Understand Argon2id key derivation
- [ ] Trace `Archive.ts` setup/unlock flow
- [ ] Review `Sentinel.ts` security utilities

### Advanced (1-2 days)
- [ ] Audit encryption implementation
- [ ] Add new storage backend
- [ ] Implement checksum validation for mnemonics
- [ ] Create custom CLI command

### Expert (1 week+)
- [ ] Full security audit
- [ ] Performance optimization (batch encryption)
- [ ] Add biometric unlock (WebAuthn)
- [ ] Implement social recovery (split mnemonic)

---

*Happy exploring! 🚀*

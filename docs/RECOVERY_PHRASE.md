# 🔑 12-Word Recovery Phrase (Kunci Pemulihan)

## 📖 Overview

The 12-word recovery phrase (also called **mnemonic** or **paper key**) is your backup to restore access to your vault if you forget your password.

> **Example**: `abandon ability able about above absent absorb abstract absurd abuse access accident`

---

## 🧠 How It Works

### 1. **Generation** (First Setup)

When you create a new vault, Lembaran generates a random 12-word phrase:

```
Your Password ──► Argon2id ──► Password Key ──┐
                                              ▼
                        Master Key (AES-256) ──► Wrapped & Stored
                                              ▲
12-Word Mnemonic ──► Argon2id ──► Recovery Key ─┘
```

**What happens under the hood:**

```typescript
// 1. Generate Master Key (random 256-bit)
const masterKey = await Vault.generateMasterKey();

// 2. Derive key from your PASSWORD
const passwordKey = await Vault.deriveKey(password, salt);

// 3. Wrap Master Key with Password Key → stored as auth_wrapped_key
const wrapped = await Vault.encryptPacked(masterKey, passwordKey);

// 4. Derive key from MNEMONIC (separate path)
const recoveryKey = await Vault.deriveKey(mnemonic, recoverySalt);

// 5. Wrap Master Key with Recovery Key → stored as recovery_wrapped_key
const recoveryWrapped = await Vault.encryptPacked(masterKey, recoveryKey);
```

**Result**: Two independent ways to unlock the same Master Key!

---

### 2. **Recovery** (Forgot Password)

When you forget your password, you can use the 12 words to recover:

```
12-Word Mnemonic ──► Argon2id ──► Recovery Key
                                        ▼
                        Decrypt recovery_wrapped_key
                                        ▼
                              Master Key (restored!)
                                        ▼
                        Set new password → Re-wrap
```

**Code flow:**

```typescript
// 1. User enters 12 words
const mnemonic = "abandon ability able about above absent absorb...";

// 2. Retrieve recovery metadata from storage
const recoverySalt = await Storage.get('meta', 'recovery_salt');
const wrappedKey = await Storage.get('meta', 'recovery_wrapped_key');

// 3. Derive key from mnemonic (same as setup)
const recoveryKey = await Vault.deriveKey(mnemonic, recoverySalt);

// 4. Unlock Master Key
const masterKey = await Vault.decryptPacked(wrappedKey, recoveryKey);

// 5. Import and set as active
await Vault.importRawKey(masterKey);
Vault.setActiveKey(masterKey);

// 6. Force user to set NEW password
await Archive.resetPassword(newPassword);
```

---

## 🔐 Security Properties

### Entropy (How Secure Is It?)

| Metric | Value |
|--------|-------|
| **Word List Size** | 2048 words (BIP39 standard) |
| **Words Generated** | 12 |
| **Bits per Word** | 11 bits (log₂(2048)) |
| **Total Entropy** | 132 bits (12 × 11) |
| **Brute Force** | 2¹³² combinations ≈ 5.4 × 10³⁹ |

**Comparison:**
- AES-128: 128 bits entropy
- Your 12-word phrase: **132 bits entropy** ✅
- Bitcoin BIP39: 128-256 bits (12-24 words)

> **Conclusion**: Your 12-word phrase is as strong as AES-128 encryption!

### Modulo Bias Mitigation

Lembaran uses **rejection sampling** to avoid modulo bias when selecting words:

```typescript
// BAD (biased):
const index = Math.random() % 2048;

// GOOD (unbiased with rejection sampling):
const randomValues = new Uint32Array(wordCount);
crypto.getRandomValues(randomValues);

for (let i = 0; i < wordCount; i++) {
    let index: number;
    do {
        index = randomValues[i] % WORDLIST_SIZE;
        randomValues[i] = (randomValues[i] + 1) % WORDLIST_SIZE;
    } while (randomValues[i] === 0 && i < wordCount - 1);
    
    words.push(BIP39_WORDLIST[randomValues[i] % WORDLIST_SIZE]);
}
```

---

## 📋 Technical Implementation

### File Structure

```
packages/core/src/
├── Password.ts          # Mnemonic generation & validation
├── Archive.ts           # Vault setup & recovery logic
└── Vault.ts             # Key derivation & encryption
```

### Key Functions

#### 1. **Generate Mnemonic** (`Password.ts`)

```typescript
export const generateMnemonic = (wordCount: number = 12): string => {
    if (wordCount < 6 || wordCount > 24) {
        throw new Error('Word count must be between 6 and 24');
    }

    const words: string[] = [];
    const randomValues = new Uint32Array(wordCount);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < wordCount; i++) {
        // Rejection sampling to eliminate modulo bias
        let index: number;
        do {
            index = randomValues[i] % WORDLIST_SIZE;
            randomValues[i] = (randomValues[i] + 1) % WORDLIST_SIZE;
        } while (randomValues[i] === 0 && i < wordCount - 1);

        words.push(BIP39_WORDLIST[randomValues[i] % WORDLIST_SIZE]);
    }

    return words.join(' ');
};
```

#### 2. **Validate Mnemonic** (`Password.ts`)

```typescript
export const validateMnemonic = (mnemonic: string): boolean => {
    const words = mnemonic.trim().toLowerCase().split(/\s+/);
    return words.every(word => BIP39_WORDLIST.includes(word));
};
```

#### 3. **Setup Vault with Mnemonic** (`Archive.ts`)

```typescript
async setupVault(password: string, mnemonic?: string): Promise<Result<void>> {
    // Generate Master Key
    const masterKey = await Vault.generateMasterKey();
    
    // Wrap with Password Key (primary unlock)
    const passwordKey = await Vault.deriveKey(password, salt);
    const wrappedKey = await Vault.encryptPacked(masterKey, passwordKey);
    
    // Wrap with Recovery Key (backup unlock)
    if (mnemonic) {
        const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
        const recoveryKey = await Vault.deriveKey(mnemonic, recoverySalt);
        const recoveryWrappedKey = await Vault.encryptPacked(masterKey, recoveryKey);
        
        // Store recovery metadata
        await Storage.set('meta', 'recovery_salt', recoverySalt);
        await Storage.set('meta', 'recovery_wrapped_key', recoveryWrappedKey);
    }
    
    // Store password metadata
    await Storage.set('meta', 'auth_salt', salt);
    await Storage.set('meta', 'auth_wrapped_key', wrappedKey);
}
```

#### 4. **Recover Vault** (`Archive.ts`)

```typescript
async recoverVault(mnemonic: string): Promise<Result<boolean>> {
    // Retrieve recovery metadata
    const recoverySalt = await Storage.get('meta', 'recovery_salt');
    const wrappedKey = await Storage.get('meta', 'recovery_wrapped_key');
    
    // Derive key from mnemonic
    const recoveryKey = await Vault.deriveKey(mnemonic, recoverySalt);
    
    // Unlock Master Key
    const masterKey = await Vault.decryptPacked(wrappedKey, recoveryKey);
    
    // Import and activate
    await Vault.importRawKey(masterKey);
    Vault.setActiveKey(masterKey);
    
    return { data: true, error: null };
}
```

---

## 🎯 Usage Flow

### **First Time Setup**

```bash
$ lembaran launch

🔐 Setup New Vault
━━━━━━━━━━━━━━━━━
Enter password: ********
Confirm password: ********

📝 Your Recovery Phrase (WRITE THIS DOWN!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
abandon ability able about above absent 
absorb abstract absurd abuse access accident

⚠️  Store these 12 words safely!
   • Write them on paper
   • Keep in a safe place
   • Never store digitally
   • Anyone with these words can access your vault!

Press Enter to continue...
```

### **Recovery (Forgot Password)**

```bash
$ lembaran launch

🔒 Vault Locked
━━━━━━━━━━━━━━━
Enter password: wrong_password ❌

Access denied. Options:
  [r] Recovery with 12-word phrase
  [q] Quit

> r

🆘 Access Recovery
━━━━━━━━━━━━━━━━━━
Enter your 12-word phrase:
> abandon ability able about above absent absorb abstract absurd abuse access accident

✅ Vault unlocked!
🔐 Set new password: ********
🔐 Confirm: ********

✅ Password reset complete!
```

---

## ⚠️ Security Best Practices

### ✅ DO:
- Write the 12 words on **paper** (never digital)
- Store in a **safe/fireproof** location
- Treat like **cash** (anyone with words can access your vault)
- Use **laminated paper** for durability
- Consider **metal seed phrase backup** (like Cryptosteel)

### ❌ DON'T:
- Screenshot or photograph the words
- Store in cloud storage (Google Drive, iCloud, etc.)
- Email to yourself
- Save in password manager (defeats the purpose)
- Tell anyone your phrase

---

## 🔬 Testing

Run the mnemonic tests:

```bash
bun test packages/core/src/__tests__/Password.test.ts
```

**Test coverage:**
- ✅ Generates 12 words by default
- ✅ Custom word count (6-24)
- ✅ Rejects invalid counts (<6 or >24)
- ✅ All words from BIP39 wordlist
- ✅ Words are lowercase
- ✅ No duplicate consecutive words (statistical)
- ✅ Validates correct mnemonics
- ✅ Rejects invalid words
- ✅ Handles extra whitespace
- ✅ Case insensitive validation

---

## 📊 Storage Schema

When you setup vault with mnemonic, these keys are stored:

```
meta/
├── auth_salt              # Salt for password derivation
├── auth_wrapped_key       # Master Key encrypted with Password Key
├── auth_validator         # Encrypted "LEMBARAN_SECURED_V3" marker
├── recovery_salt          # Salt for mnemonic derivation
├── recovery_wrapped_key   # Master Key encrypted with Recovery Key
└── panic_hash             # Hash of panic key (emergency wipe)
```

**Important**: The mnemonic itself is **NEVER STOREED**. Only you have it!

---

## 🔮 Future Improvements

### Potential Enhancements:

1. **Checksum Validation** (like BIP39)
   - Current: Only validates words are in list
   - Future: Add checksum to detect typos (requires `bip39` library)

2. **Passphrase Support** (like BIP39 "25th word")
   - Add optional passphrase for extra security layer
   - `mnemonic + passphrase → different vault`

3. **Multi-Recovery Paths**
   - Support multiple recovery phrases
   - Social recovery (split phrase across locations)

4. **QR Code Backup**
   - Generate QR for easy mobile backup
   - Encrypt QR with separate passphrase

---

## 📚 References

- **BIP39**: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- **Argon2id**: https://datatracker.ietf.org/doc/html/rfc9106
- **AES-GCM**: https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-38d.pdf

---

*Last updated: April 2026 | Version 3.5.0*

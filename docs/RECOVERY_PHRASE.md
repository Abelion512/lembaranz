# 🔑 12-Word Recovery Phrase

## 📖 Overview

The 12-word recovery phrase (also called **mnemonic** or **paper key**) is your
backup to restore access to your vault if you forget your master password.

> **Example**: `abandon ability able about above absent absorb abstract absurd abuse access accident`

Lembaranz uses the standard **BIP39** English wordlist, so a phrase generated here
is interoperable with any BIP39 wallet.

---

## 🧠 How It Works

### 1. Generation (first setup)

When you create a new vault, Lembaranz generates a random 12-word phrase and wraps
the same master key twice, under two independently derived keys:

```
Your Password ──► Argon2id ──► Password Key ──┐
                                              ▼
                        Master Key (AES-256) ──► Wrapped & Stored
                                              ▲
12-Word Mnemonic ──► Argon2id ──► Recovery Key ─┘
```

**What happens under the hood** (`Archive.setupVault`):

```typescript
// 1. Generate Master Key (random 256-bit)
const masterKey = await Vault.generateMasterKey();
const masterKeyBuffer = await Vault.exportRawKey(masterKey);

// 2. Derive a key from your PASSWORD and wrap the master key
const salt = crypto.getRandomValues(new Uint8Array(16));
const passwordKey = await Vault.deriveKey(password, salt);
const wrappedKey = await Vault.encryptPacked(
  Vault.bytesToBase64(new Uint8Array(masterKeyBuffer)),
  passwordKey
);

await Storage.set("meta", "auth_salt", Vault.bytesToHex(salt));
await Storage.set("meta", "auth_wrapped_key", wrappedKey);

// 3. Derive a separate key from the MNEMONIC and wrap it again
if (mnemonic) {
  const mnemonicSalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryKey = await Vault.deriveKey(mnemonic, mnemonicSalt);
  const recoveryWrappedKey = await Vault.encryptPacked(
    Vault.bytesToBase64(new Uint8Array(masterKeyBuffer)),
    recoveryKey
  );

  await Storage.set("meta", "recovery_salt", Vault.bytesToHex(mnemonicSalt));
  await Storage.set("meta", "recovery_wrapped_key", recoveryWrappedKey);
}
```

**Result**: two independent ways to unwrap the same master key. Because the two
salts are independent, an attacker who learns the master password still cannot
recover the recovery path.

---

### 2. Recovery (forgot password)

```
12-Word Mnemonic ──► Argon2id ──► Recovery Key
                                        ▼
                        Decrypt recovery_wrapped_key
                                        ▼
                              Master Key (restored!)
                                        ▼
                        Set new password → Re-wrap
```

**Code flow** (`Archive.recoverVault`):

```typescript
// 0. Rate limit. The phrase is the highest-value secret in the vault.
const rateCheck = Sentinel.checkRateLimit("vault-recovery");
if (!rateCheck.allowed) return { data: null, error: new Error("Too many failed recovery attempts. Try again later.") };

// 1. Retrieve recovery metadata
const mSaltHex = await Storage.get("meta", "recovery_salt");
const wrappedKey = await Storage.get("meta", "recovery_wrapped_key");
if (!mSaltHex || !wrappedKey) return { data: null, error: new Error("Recovery data not found") };

// 2. Derive the key from the mnemonic
const recoveryKey = await Vault.deriveKey(mnemonic, Vault.hexToBytes(mSaltHex));

// 3. Unwrap the master key
let decResult = await Vault.decryptPacked(wrappedKey, recoveryKey);

// 3b. Fallback for vaults wrapped while PBKDF2 was the active KDF.
if (decResult.error) {
  const legacyKey = await Vault.deriveKeyLegacy(mnemonic, Vault.hexToBytes(mSaltHex));
  const legacyDec = await Vault.decryptPacked(wrappedKey, legacyKey);
  if (!legacyDec.error) { decResult = legacyDec; legacyRecovery = true; }
}
if (decResult.error) {
  await Audit.log("SECURITY_ALERT", "Failed vault recovery attempt detected (wrong recovery phrase)");
  return { data: null, error: new Error("Recovery phrase did not unlock this vault. Check the words and their order.") };
}

// 4. Import and activate the restored master key
const masterKey = await Vault.importRawKey(Vault.base64ToBytes(decResult.data).buffer);
Vault.setActiveKey(masterKey);

// 5. If it was a legacy wrap, re-wrap with Argon2id so the recovery path
//    no longer depends on the old KDF. Note ciphertext is never re-encrypted.
```

Failed attempts and lockouts are recorded in the local audit ledger as
`SECURITY_ALERT`. After 5 failures the recovery path is locked for 5 minutes
(`Sentinel.MAX_ATTEMPTS` / `Sentinel.LOCKOUT_DURATION`). A successful recovery
resets the counter.

---

## 🔐 Security Properties

### Entropy (how secure is it?)

| Metric | Value |
|--------|-------|
| **Word list size** | 2048 words (BIP39 English) |
| **Words generated** | 12 |
| **Bits per word** | 11 bits (log₂ 2048) |
| **Total bits encoded** | 132 bits (12 × 11) |
| **Checksum bits** | 4 bits |
| **Actual entropy** | **128 bits** |
| **Brute force** | 2¹²⁸ ≈ 3.4 × 10³⁸ |

The four checksum bits are the price of typo detection, not extra entropy: a
12-word phrase carries 128 bits of entropy and 4 bits of checksum.

> **Conclusion**: 128 bits of entropy is in the same class as AES-128.

### No modulo bias

Word selection does **not** need rejection sampling, and none is used. The
wordlist holds 2048 = 2¹¹ words and the generator draws `uint32` values, so
2³² is an exact multiple of 2¹¹. Every word is equally likely. (An earlier
version of this document described rejection sampling that was never
implemented; the code comment it came from was also wrong and has been fixed.)

### BIP39 checksum

`generateMnemonic(12)` produces a real BIP39 mnemonic: 16 random bytes of
entropy, the leading 4 bits of their SHA-256 as a checksum, and the two
concatenated as 11-bit word indices.

`validateMnemonicChecksum(phrase)` checks those 4 bits, so most single-word
typos are caught locally instead of surfacing later as a failed unlock.

Note that a 12-word phrase has only 4 checksum bits, so roughly **1 in 16**
single-word typos still pass by design. That is a property of BIP39, not a
defect.

The CLI shows a checksum mismatch as a **warning, never a block**. Phrases
written down by earlier releases may predate the checksum, and refusing them
would lock those users out of their own vault. Recovery is still attempted.

---

## 📋 Technical Implementation

### File structure

```
packages/core/src/
├── Password.ts    # Mnemonic generation & validation
├── Archive.ts     # Vault setup, unlock & recovery logic
└── Vault.ts       # Key derivation & encryption
```

### Key functions

#### 1. Generate a mnemonic (`Password.ts`)

```typescript
export const generateMnemonic = (wordCount: number = 12): string => {
  if (wordCount < 6 || wordCount > 24) throw new Error("Word count must be between 6 and 24");

  const entropyBytes = BIP39_ENTROPY_BYTES[wordCount];
  if (!entropyBytes) {
    // Non-BIP39 length: uniform random draw, no checksum.
    const words: string[] = [];
    const randomValues = new Uint32Array(wordCount);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < wordCount; i++) words.push(BIP39_WORDLIST[randomValues[i] % WORDLIST_SIZE]);
    return words.join(" ");
  }

  const entropy = crypto.getRandomValues(new Uint8Array(entropyBytes));
  let bits = "";
  for (const byte of entropy) bits += byte.toString(2).padStart(8, "0");
  bits += checksumBits(sha256(entropy), entropyBytes / 4);

  const words: string[] = [];
  for (let i = 0; i < bits.length; i += 11) words.push(BIP39_WORDLIST[parseInt(bits.slice(i, i + 11), 2)]);
  return words.join(" ");
};
```

At 12, 15, 18, 21 and 24 words this is standard BIP39. Any other length in the
accepted 6-24 range falls back to the uniform path and carries no checksum.

#### 2. Validate a mnemonic (`Password.ts`)

```typescript
// Word-list check only. This deliberately skips the checksum so that phrases
// issued before the checksum existed keep unlocking their vault.
export const validateMnemonic = (mnemonic: string): boolean => { /* every word ∈ BIP39 */ };

// Checksum check. Use to warn, never to block recovery.
export const validateMnemonicChecksum = (mnemonic: string): boolean => { /* 4-bit checksum */ };
```

---

## 🎯 Usage Flow

### First-time setup

```bash
$ lembaranz setup

🚀 Lembaranz Setup Wizard

📝 Your Recovery Phrase
━━━━━━━━━━━━━━━━━━━━━━
1. abandon      2. ability     3. able        4. about
5. above        6. absent      7. absorb      8. abstract
9. absurd      10. abuse      11. access     12. accident

⚠️  IMPORTANT: Write these 12 words on PAPER.
   Copy the 12 words above onto paper, then scroll back up.
   Do NOT photograph, screenshot, or store them digitally.
   Anyone holding these words can open your vault, forever.

? Have you written them down? › yes
```

### Recovery (forgot password)

```bash
$ lembaranz setup          # or press [r] on the TUI lock screen

🆘 Recovery Mode
Enter your 12-word recovery phrase:
? 12-word phrase: › abandon ability able about above absent …

⚠  This phrase fails its BIP39 checksum.
   One word is probably mistyped, or the phrase came from an older release.
   Trying anyway.

✅ Vault recovered!
? Set new password: ********
✓ Password updated!
```

---

## ⚠️ Security Best Practices

### ✅ DO

- Write the 12 words on **paper** (never digital)
- Store in a **safe/fireproof** location
- Treat like **cash** (anyone with the words can open your vault)
- Use **laminated paper** for durability
- Consider a **metal seed phrase backup** (like Cryptosteel)
- Re-read the phrase from your backup before you need it

### ❌ DON'T

- Screenshot or photograph the words
- Store in cloud storage (Google Drive, iCloud, etc.)
- Email to yourself
- Save in another password manager (defeats the purpose)
- Tell anyone your phrase

---

## 🔬 Testing

```bash
bun test packages/core/src/__tests__/Password.test.ts
```

**Test coverage:**

- ✅ Wordlist is exactly 2048 words, and `zoo` is reachable
- ✅ Every BIP39 length (12/15/18/21/24) generates a valid checksum
- ✅ Canonical BIP39 test vectors validate
- ✅ Roughly 1 in 16 single-word typos pass a 4-bit checksum (statistical, 2000 trials)
- ✅ `validateMnemonicChecksum` rejects non-BIP39 lengths
- ✅ `validateMnemonic` still accepts pre-checksum phrases
- ✅ Custom word count (6-24) and rejection of out-of-range counts

---

## 📊 Storage Schema

When you set up a vault with a mnemonic, these keys are stored:

```
meta/
├── auth_salt              # Salt for password key derivation
├── auth_wrapped_key       # Master Key wrapped with the Password Key
├── auth_validator         # Master Key encrypting the "LEMBARANZ_SECURED_V3" marker
├── recovery_salt          # Salt for recovery key derivation
├── recovery_wrapped_key   # Master Key wrapped with the Recovery Key
└── panic_hash             # Hash of the panic key (emergency wipe)
```

The mnemonic itself is **never stored**. Only you have it.

---

## 📚 References

- **BIP39**: https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt
- **Argon2id**: https://datatracker.ietf.org/doc/html/rfc9106
- **AES-GCM**: https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-38d.pdf

---

*Last updated: October 2026 | Applies to `@lembaranz/core` and `@lembaranz/cli` 0.2.0*

# Privacy Policy

**Last Updated: September 30, 2026**

Privacy is a fundamental right at Lembaranz.

## 1. Data Collection

We **do not collect** personal data, notes, or passwords.
Lembaranz runs entirely client-side: the web dashboard works in your browser, and the CLI works on your machine.

## 2. Analytics

This software does not include third-party trackers, analytics, or telemetry.
No network requests are made while you read or write vault data.

The web interface loads nothing from a third party. It does not fetch a web
font from a font CDN, it does not call an analytics endpoint, and it does not
pull an icon set or a script from a CDN. Its type is drawn from fonts already
installed on your machine, so visiting the page does not tell a third party
which browser, operating system, or font list you have.

## 3. Encryption

Sensitive data is encrypted with **AES-GCM 256-bit** before it touches storage. The encryption key is derived from your password using **Argon2id** (`t=2`, `m=64 MiB`, `p=1`) and never leaves your device. Vaults and backups created by earlier releases that used PBKDF2 are unlocked through an automatic fallback and re-wrapped with Argon2id; your note ciphertext is never re-encrypted during that migration.

## 4. Local Audit Ledger

The audit trail is a local, hash-chained ledger (tamper-evident). It never leaves your device. You may choose to record its head hash externally to detect truncation; that is entirely under your control.

## 5. Language & Documentation

Documentation and UI are published in **English (base)** with **Simplified Chinese** as the secondary language. Translations never change how data is processed.

## 6. Your Responsibility

Because there is no server-side copy of your keys, **data cannot be recovered if you lose both your master password and your recovery mnemonic**.

---

*Stay Secure. Stay Local.*

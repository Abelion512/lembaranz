## 2025-05-27 - [Plaintext Secrets Storage]
**Vulnerability:** The CLI setup wizard (`packages/cli/src/commands/Setup.ts`) saved the user's master password and mnemonic recovery phrase in plaintext to a local file (`.lembaranz/setup-progress.json`) to allow resuming an interrupted setup process.
**Learning:** This is a critical security vulnerability because any local process or user with read access to that directory could steal the master key/recovery phrase.
**Prevention:** Sensitive state variables like master passwords, mnemonics, or encryption keys must always be stored exclusively in memory during setup or execution. State persistence should never log these values to disk unencrypted, even temporarily.

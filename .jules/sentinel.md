
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

## 2024-03-05 - [Fix XSS Bypass in Markdown Link Scheme Validation]
**Vulnerability:** The regex used to sanitize dangerous links in `packages/web/lib/safeMarked.ts` (`/^(javascript|data|vbscript|file):/i`) could be easily bypassed by using HTML entities (e.g., `javascript&#58;`), URL encodings (e.g., `%6A...`), or whitespace padding (e.g., ` javascript:`).
**Learning:** Checking for malicious URL schemes in markdown rendering must involve decoding entities, URL components, and aggressively removing all whitespaces and control characters prior to testing against the scheme pattern. Otherwise, XSS payloads in markdown links can bypass superficial validation.
**Prevention:** Implement a robust pre-processing function (e.g., `isDangerousUrl`) that decodes `decodeURIComponent`, resolves `&#x` and `&#` entities, decodes string representations like `&colon;`, and strips `[\x00-\x20]+` characters before applying the schema validation regex on all external user-supplied or rendered URLs.

## 2025-05-24 - [Harden Environment Variable Sanitization in Vault Context Injection]
**Vulnerability:** The environment variable injection logic in `packages/cli/src/commands/Config.ts` (`run` command) previously lacked strict validation for environment variable keys and values, potentially allowing key injection or the passing of dangerous control characters (e.g., null bytes).
**Learning:** Overly broad blocklists (e.g., stripping all keys starting with `NODE_` or `LD_`) can cause critical regressions by inadvertently removing standard variables like `NODE_ENV` or `LDAP_URL`. Value sanitization must also be careful not to strip standard whitespace control characters (`\t`, `\n`, `\r`) which are often necessary for multi-line configurations like RSA keys.
**Prevention:** Implement strict regex validation for keys (`/^[a-zA-Z_][a-zA-Z0-9_]*$/`), use an explicit and targeted blocklist (`DANGEROUS_ENV_KEYS`) for dangerous keys rather than broad prefixes, and safely strip only non-whitespace control characters (`/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`) from values.


## 2025-05-25 - [Fix Plaintext Credential Storage in Setup Wizard]
**Vulnerability:** The CLI setup wizard (`packages/cli/src/commands/Setup.ts`) temporarily saved the user's master password and recovery phrase (mnemonic) in plaintext to a local file (`.lembaranz/setup-progress.json`) in order to resume progress if the wizard was interrupted.
**Learning:** Saving highly sensitive credentials to the disk in plaintext—even temporarily—exposes them to unauthorized reading and negates the security benefits of the encrypted vault. Operating system or application crashes can also cause the temporary file to be abandoned and remain on disk indefinitely.
**Prevention:** Never save passwords, mnemonics, or keys in plaintext. State persistence for multi-step setup flows must be handled entirely in memory. If persistence is absolutely necessary, use secure platform-native credential managers rather than plain files.

## 2025-05-26 - [Remove Plaintext Saving of Master Password and Mnemonic]
**Vulnerability:** The setup wizard (`packages/cli/src/commands/Setup.ts`) saved the user's master password and mnemonic to a local JSON file (`.lembaranz/setup-progress.json`) in plaintext to allow resuming an interrupted setup process.
**Learning:** Writing highly sensitive setup credentials (master password, recovery phrase) to disk in plaintext completely undermines the zero-knowledge and encryption models. State persistence for multi-step setup flows must be handled entirely in memory.
**Prevention:** Never use local temporary files to store unencrypted passwords or mnemonics for the sake of UX conveniences like "resuming setup". If a setup process is interrupted, force the user to start over completely to ensure credentials only ever exist in memory or encrypted in the vault.

## 2025-05-27 - [Plaintext Secrets Storage]
**Vulnerability:** The CLI setup wizard (`packages/cli/src/commands/Setup.ts`) saved the user's master password and mnemonic recovery phrase in plaintext to a local file (`.lembaranz/setup-progress.json`) to allow resuming an interrupted setup process.
**Learning:** This is a critical security vulnerability because any local process or user with read access to that directory could steal the master key/recovery phrase.
**Prevention:** Sensitive state variables like master passwords, mnemonics, or encryption keys must always be stored exclusively in memory during setup or execution. State persistence should never log these values to disk unencrypted, even temporarily.

## 2024-05-29 - [Fix URIError XSS Bypass in safeMarked]
**Vulnerability:** The `isDangerousUrl` validation utility within `packages/web/lib/safeMarked.ts` relied on `decodeURIComponent` which natively throws a `URIError` when it encounters malformed encoding (e.g. `%FF`). The existing code would catch the error and do nothing, allowing the validation regex to test the original malformed URL string instead of its decoded version, rendering evasion tactics possible.
**Learning:** `decodeURIComponent` should never be blindly trusted without handling malformed components in a robust fallback mechanism. If an attacker submits a protocol encoded purely in hex with an invalid trailing character (`%6A%61%76%61%73%63%72%69%70%74%3Aalert(1)%FF`), they can successfully bypass security validations entirely.
**Prevention:** If `decodeURIComponent` fails, always fall back to a manual character-by-character replacement function to reliably decode individual components before falling through to string/pattern validations.

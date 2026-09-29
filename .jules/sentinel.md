# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2026-09-18 - Insecure File and Directory Permissions (CWE-732)
**Vulnerability:** Sensitive files like `.env`, vault files, and directories containing configuration/secrets were being created with default OS permissions, which could be too permissive and allow other local users to access them.
**Learning:** Default `fs.writeFile` and `fs.mkdir` behavior relies on `umask`, which might not be sufficiently restrictive (e.g., 0o022 means 0o644 for files).
**Prevention:** Always explicitly provide `{ mode: 0o600 }` for sensitive files and `{ mode: 0o700 }` for sensitive directories when using `fs` modules.

## 2026-07-27 - [Fix XSS Bypass via Double Encoding in safeMarked]
**Vulnerability:** XSS bypass possible in safeMarked because isDangerousUrl only single-pass decoded URLs, allowing attackers to double URL encode malicious javascript: URIs.
**Learning:** Single-pass decoding is insufficient for security filters. Attackers can layer encodings (like double URL encoding) to bypass regex signatures.
**Prevention:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop (e.g., while loop) to recursively unescape all layers of encoding.

## 2026-09-25 - [Insecure File/Directory Permissions]
**Vulnerability:** Files and directories containing sensitive data were created with default permissions, which may allow unauthorized local access.
**Learning:** Default Node.js filesystem APIs do not automatically restrict access.
**Prevention:** Always explicitly set restrictive permissions (`{ mode: 0o600 }` for files, `{ mode: 0o700 }` for directories) when creating files or folders that handle sensitive data to prevent CWE-732.

## 2026-08-03 - Insecure File Permissions Mitigated
**Vulnerability:** Use of `fs.writeFile` to write sensitive data without explicitly setting restrictive file permissions.
**Learning:** Default filesystem permissions may allow unauthorized local read access.
**Prevention:** Always explicitly set restrictive file permissions (e.g., `{ encoding: 'utf8', mode: 0o600 }` or `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or encrypted backups.
## 2024-05-15 - Insecure File Permissions for Sensitive Files
**Vulnerability:** fs.writeFile was writing sensitive files (.env configs and .lembaranz backups) with default permissions (0o666 minus umask), potentially allowing unauthorized local reads (CWE-732).
**Learning:** The codebase lacked a unified secure file writing approach, leading to inconsistent permissions where some modules defaulted to OS defaults for sensitive data.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when using fs.writeFile for sensitive files.

## 2024-07-25 - Insecure File Permissions
**Vulnerability:** Sensitive files like `.env` and `.lembaranz` backups were written with default permissions, allowing unauthorized local reads.
**Learning:** Default Node.js `fs.writeFile` permissions are 0o666 (minus umask), which does not protect sensitive data from other users on the system.
**Prevention:** Always explicitly set `{ mode: 0o600 }` when writing files that contain secrets or sensitive user data.

## 2024-07-24 - Double Encoding XSS Bypass
**Vulnerability:** The `isDangerousUrl` function in the markdown renderer used a single-pass decoding logic to filter out dangerous URL protocols like `javascript:`. This could be bypassed using multiple layers of encoding, such as double URL-encoding.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must recursively unescape all layers of encoding (e.g. double URL encoding). Single-pass decoding is insufficient.
**Prevention:** Use an iterative decoding loop to recursively unescape all layers of encoding until the string stabilizes (with a max depth to avoid DoS).

## 2026-07-23 - [Insecure File Permissions / CWE-732]
**Vulnerability:** Found multiple instances where sensitive files (`.env` files containing API keys and exported `.lembaranz` encrypted vault backups) were written to disk using `fs.writeFile` without specifying strict file permissions (mode). This results in the files being created with default permissions (often `0o666` minus umask), which may allow unauthorized local users or processes to read sensitive secrets (CWE-732).
**Learning:** In Node.js, `fs.writeFile` defaults to mode `0o666` when creating new files. The developers failed to recognize that local environment and backup files hold critical credentials and must be restricted immediately upon creation.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` or similar file-creation APIs for sensitive files to ensure only the owner can read/write them.
## 2024-07-22 - [Insecure File Permissions for Sensitive Files]
**Vulnerability:** Several places in the codebase use `fs.writeFile` to write sensitive files like `.env` configurations and `.lembaranz` backups without specifying file permissions.
**Learning:** Default permissions for file creation without `mode` can be insecure (often 0o666 minus umask), potentially allowing unauthorized local read access to sensitive data (CWE-732).
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files.

## 2024-05-18 - XSS evasion via double-encoding in Markdown parser
**Vulnerability:** The `isDangerousUrl` function in `safeMarked.ts` only performed a single pass of URI and HTML entity decoding when checking for malicious protocols (e.g., `javascript:`).
**Learning:** This allowed an attacker to bypass the security check by double-encoding the malicious payload (e.g., `%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)`), which would only be partially decoded by the single pass, evading the check, but still executed by the browser.
**Prevention:** Always use an iterative decoding loop (e.g., up to 5 times) to recursively unescape all layers of encoding until the string stops changing, ensuring that deeply nested encodings are fully neutralized before validation.
## 2024-07-20 - Fix Insecure File Permissions for Sensitive Files
**Vulnerability:** fs.writeFile was used to write sensitive files like .env and .lembaranz backups without restrictive file permissions.
**Learning:** Default permissions on created files (e.g. 0o666 minus umask) may allow unauthorized local reads by other users on the system.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when using fs.writeFile for sensitive files.
## 2026-07-19 - Fix Insecure File Permissions (CWE-732)
**Vulnerability:** Found insecure default file permissions when writing sensitive files like .env or .lembaranz backups, leading to CWE-732.
**Learning:** Default fs.writeFile permissions (0o666 minus umask) can allow unauthorized local users to read sensitive credentials and database files.
**Prevention:** Always explicitly set { mode: 0o600 } for sensitive file writes using fs.writeFile.

## 2024-05-24 - Fix Insecure File Permissions in File Creation (CWE-732)
**Vulnerability:** Calls to `fs.writeFile` in `Context.ts`, `Config.ts`, and `TerminalUI.ts` created sensitive files (like `.env` and `.lembaranz` backup files) without explicitly setting file permissions, leading to files being created with default permissions (often `0o666` minus umask) which can allow unauthorized local users to read sensitive credentials and configurations.
**Learning:** Default file creation permissions in Node.js are determined by the system umask. For files containing sensitive information, relying on the system default is insecure as it may inadvertently grant read access to other local users.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` encrypted backups, ensuring only the owner can read/write them.

## 2024-04-18 - [Insecure File Permissions (CWE-732) on Sensitive Exports]
**Vulnerability:** `fs.writeFile` was used without explicit modes for sensitive files (`.env` and `.lembaranz` backup exports), allowing default permissions (0o666 minus umask) which risks local unauthorized read access.
**Learning:** Default Node.js file system APIs do not assume security. When exporting credentials or encrypted backup vaults, explicit `0o600` modes must be enforced consistently across all CLI/TUI and core modules.
**Prevention:** Always pass `{ mode: 0o600 }` (or similar restrictive modes) in the options object when calling `fs.writeFile` for any file containing secrets or PII.

## 2025-02-09 - [Preventing Double-Encoded XSS Bypasses]
**Vulnerability:** XSS filters using single-pass decoding can be bypassed by double URL encoding or mixed encoding (e.g., HTML entities inside URL encoding).
**Learning:** Attackers encode malicious payloads multiple times because the browser may perform recursive decoding natively, while naive filters only decode once and fail to match the signature.
**Prevention:** Use an iterative loop (e.g., up to 5 times) to repeatedly decode and unescape input until it stabilizes before validating for dangerous schemes like `javascript:`.

## 2024-07-17 - Insecure File Permissions for Secrets (CWE-732)
**Vulnerability:** The application writes highly sensitive files (e.g., `.env` configuration files and `.lembaranz` encrypted vault backups) using `fs.writeFile` without explicitly specifying permissions. This falls back to the process umask, which can default to insecure permissions like 0o644, allowing other users on the local machine to read the files.
**Learning:** Even encrypted data or dynamically injected local environments represent sensitive attack surfaces. Failing to harden the filesystem layer compromises the defense-in-depth model, exposing secrets to lateral movement.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` backups to ensure they are readable and writable only by the owner.
## 2025-02-27 - Insecure File Permissions for .env and exported files
**Vulnerability:** fs.writeFile defaults to 0o666 permissions allowing local read access to sensitive .env configurations and encrypted backups.
**Learning:** Default node.js fs permissions are not restrictive enough for sensitive data.
**Prevention:** Always explicitly set `{ mode: 0o600 }` when writing files that contain sensitive secrets or environment variables.
## 2024-05-24 - Insecure File Permissions on Sensitive Files
**Vulnerability:** Default file permissions were used when creating .env files and encrypted backups.
**Learning:** Node.js fs.writeFile defaults to 0o666 (minus umask), exposing sensitive data to other local system users.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) for sensitive files.

## 2025-01-01 - Fix Insecure File Permissions for Sensitive Files
**Vulnerability:** Sensitive files like `.env` configurations and `.lembaranz` backups were written to disk using `fs.writeFile` without explicit file permissions, relying on the default umask which could allow unauthorized local read access.
**Learning:** Default file creation permissions do not guarantee confidentiality for sensitive data on multi-user systems.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) in the options object when writing sensitive files.

## 2024-07-10 - Insecure File Permissions for Sensitive Configurations
**Vulnerability:** File writes for `.env` and `.lembaranz` backup files were missing explicit mode configuration, leaving them exposed to local unauthorized reads (CWE-732).
**Learning:** Using `fs.writeFile` with default permissions uses `0o666` (minus umask), which provides read access to all local users.
**Prevention:** Always specify `{ mode: 0o600 }` when writing credentials or database files.

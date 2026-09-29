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

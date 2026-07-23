# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2026-07-23 - [Insecure File Permissions / CWE-732]
**Vulnerability:** Found multiple instances where sensitive files (`.env` files containing API keys and exported `.lembaranz` encrypted vault backups) were written to disk using `fs.writeFile` without specifying strict file permissions (mode). This results in the files being created with default permissions (often `0o666` minus umask), which may allow unauthorized local users or processes to read sensitive secrets (CWE-732).
**Learning:** In Node.js, `fs.writeFile` defaults to mode `0o666` when creating new files. The developers failed to recognize that local environment and backup files hold critical credentials and must be restricted immediately upon creation.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` or similar file-creation APIs for sensitive files to ensure only the owner can read/write them.

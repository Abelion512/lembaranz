# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-10-27 - [Insecure File Permissions]
**Vulnerability:** Missing explicit secure permissions when writing sensitive files like `.env` and `.lembaranz` backups via `fs.writeFile` (CWE-732).
**Learning:** Default Node.js `fs.writeFile` permissions are usually `0o666` modified by the process umask, which can allow unauthorized local users to read sensitive credentials.
**Prevention:** Always explicitly define restrictive file permissions (e.g., `{ mode: 0o600 }`) in the options object when writing sensitive files to disk.

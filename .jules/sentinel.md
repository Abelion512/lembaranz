# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2024-07-22 - [Insecure File Permissions for Sensitive Files]
**Vulnerability:** Several places in the codebase use `fs.writeFile` to write sensitive files like `.env` configurations and `.lembaranz` backups without specifying file permissions.
**Learning:** Default permissions for file creation without `mode` can be insecure (often 0o666 minus umask), potentially allowing unauthorized local read access to sensitive data (CWE-732).
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files.

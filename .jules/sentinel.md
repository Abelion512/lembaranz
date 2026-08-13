# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2026-08-03 - Insecure File Permissions Mitigated
**Vulnerability:** Use of `fs.writeFile` to write sensitive data without explicitly setting restrictive file permissions.
**Learning:** Default filesystem permissions may allow unauthorized local read access.
**Prevention:** Always explicitly set restrictive file permissions (e.g., `{ encoding: 'utf8', mode: 0o600 }` or `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or encrypted backups.

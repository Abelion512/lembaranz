# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-06-25 - CWE-732 Insecure File Permissions for Sensitive Files
**Vulnerability:** Use of `fs.writeFile` to write sensitive files (like `.env` and backups) without explicitly providing restrictive file modes, causing them to use default, potentially insecure permissions (e.g. `0o666`).
**Learning:** Default permissions might allow unauthorized local reads by other users on a multi-user system.
**Prevention:** To prevent CWE-732, explicitly set restrictive permissions `mode: 0o600` when calling `fs.writeFile` for credentials, environments configurations, and vault exports.

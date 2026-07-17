# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-07-17 - Insecure File Permissions for Secrets (CWE-732)
**Vulnerability:** The application writes highly sensitive files (e.g., `.env` configuration files and `.lembaranz` encrypted vault backups) using `fs.writeFile` without explicitly specifying permissions. This falls back to the process umask, which can default to insecure permissions like 0o644, allowing other users on the local machine to read the files.
**Learning:** Even encrypted data or dynamically injected local environments represent sensitive attack surfaces. Failing to harden the filesystem layer compromises the defense-in-depth model, exposing secrets to lateral movement.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` backups to ensure they are readable and writable only by the owner.

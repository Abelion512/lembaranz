# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-02-27 - Secure File Permissions
**Vulnerability:** Sensitive files like `.env` configs and `.lembaranz` backup archives were written using `fs.writeFile` with default permissions (`0o666`).
**Learning:** Default Node.js filesystem permissions can expose sensitive material to other unauthorized local users on a multi-user system (CWE-732).
**Prevention:** Always explicitly define `{ mode: 0o600 }` alongside the encoding when writing critical material to disk.

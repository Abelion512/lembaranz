# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-01-01 - Fix Insecure File Permissions for Sensitive Files
**Vulnerability:** Sensitive files like `.env` configurations and `.lembaranz` backups were written to disk using `fs.writeFile` without explicit file permissions, relying on the default umask which could allow unauthorized local read access.
**Learning:** Default file creation permissions do not guarantee confidentiality for sensitive data on multi-user systems.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) in the options object when writing sensitive files.

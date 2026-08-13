# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2026-08-07 - Enforce Secure File and Directory Permissions
**Vulnerability:** Files containing sensitive data (e.g. .env, logs) and vault directories were created with permissive default permissions.
**Learning:** Relying on default fs.mkdir and fs.writeFile permissions can expose secure data to other local users. Permissions must be explicitly set to restrict access to the current user.
**Prevention:** Always use { mode: 0o700 } for directories and { mode: 0o600 } for files when interacting with the filesystem API for sensitive data.

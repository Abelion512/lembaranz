# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-07-02 - Insecure File Permissions in Environment and Export Files
**Vulnerability:** Insecure file permissions (CWE-732). Files like `.env` and `lembaranz-petikan-*.lembaranz` were being written using default permissions (0o666 minus umask), potentially allowing unauthorized local read access.
**Learning:** Default `fs.writeFile` permissions in Node.js/Bun are unsafe for sensitive files if a restrictive umask is not set.
**Prevention:** Always explicitly set `{ mode: 0o600 }` (or similar restrictive modes) when using `fs.writeFile` or similar APIs for sensitive data.

# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-06-15 - Insecure File Permissions on Sensitive Files
**Vulnerability:** Calling `fs.writeFile` on sensitive files (like `.env` configurations and `.lembaranz` encrypted backup exports) used default file permissions, which could allow unauthorized local system users to read them (CWE-732).
**Learning:** In Node.js, unless explicitly specified, `fs.writeFile` uses the system's default `umask` (often resulting in `0o644` or `0o666`). For sensitive files, default permissions are insufficiently restrictive.
**Prevention:** Always pass an options object with `mode: 0o600` (read/write only for the owner) when saving sensitive files via `fs.writeFile`.

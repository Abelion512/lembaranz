# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-02-24 - Fix insecure file permissions on sensitive files
**Vulnerability:** Default Node.js `fs.writeFile` permissions allow potentially broad read access to sensitive `.env` and `.lembaranz` backup files on shared systems.
**Learning:** When using Node.js filesystem modules to write sensitive content like credentials, the default permissions (0o666 minus umask) may be too permissive, violating the principle of least privilege.
**Prevention:** Always explicitly set restrictive file permissions (e.g., `{ mode: 0o600 }`) when creating or modifying files containing secrets or encrypted backups to ensure only the owner can read or write them.

# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-06-21 - CWE-732: Insecure Default File Permissions for Sensitive Data
**Vulnerability:** Calling `fs.writeFile` without explicit secure `mode` arguments resulted in sensitive files (e.g., local `.env` configurations and encrypted `.lembaranz` backup exports) being created with default permissions (typically `0o666` minus umask), potentially allowing unauthorized local system users to read sensitive contents.
**Learning:** Node.js file system APIs like `fs.writeFile` do not default to restrictive permissions. When writing files that contain credentials or cryptographic backups, developers must explicitly override the default OS umask logic to restrict read/write access.
**Prevention:** Always enforce strict file permission arguments (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` or `fs.writeFileSync` to create files containing sensitive data.

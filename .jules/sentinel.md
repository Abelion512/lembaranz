# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-06-13 - Insecure File Permissions for Exported Secrets

**Vulnerability:** The CLI and Core packages were writing sensitive data (like exported environments, encrypted archives, and `.env` files) to disk using default filesystem permissions (typically `0o666` modified by umask). This allowed unauthorized local users to read the exported files or local configuration files.
**Learning:** Hardcoded default permissions in Node.js `fs.writeFile` lead to Local File Inclusion or unauthorized secret exposure in multi-user environments. Explicit restrictive modes are necessary when handling credentials or cryptographic exports.
**Prevention:** Always define explicit file permissions (e.g., `{ mode: 0o600 }`) in `fs.writeFile` calls when outputting any sensitive data, especially for environment variables, credentials, or backups.

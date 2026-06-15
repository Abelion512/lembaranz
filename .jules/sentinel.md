# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-05-20 - Insecure File Permissions for Sensitive Data (CWE-732)
**Vulnerability:** Calls to `fs.writeFile` for sensitive files like `.env` configurations and `.lembaranz` encrypted backups were missing explicit file mode permissions, potentially defaulting to `0o666` (minus umask), which allows unauthorized local read access.
**Learning:** Default Node.js filesystem permissions can expose sensitive cryptographic and configuration files to local privilege escalation vectors or unauthorized users on multi-tenant environments.
**Prevention:** Always explicitly define restrictive file permissions `(e.g., { mode: 0o600 })` when writing any sensitive material (secrets, config, keys, backups) using `fs.writeFile`.

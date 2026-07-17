# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2026-07-09 - Fix CWE-732 Insecure File Permissions for Sensitive Files
**Vulnerability:** Found `fs.writeFile` calls creating `.env` and `.lembaranz` backup files with default file permissions (0o666 minus umask), exposing them to unauthorized local reads.
**Learning:** Default Node.js `fs.writeFile` behavior is insecure for sensitive files in a multi-user environment. Explicit file permission sets must be applied to prevent local data exposure.
**Prevention:** Always explicitly define `{ mode: 0o600 }` in the options object of `fs.writeFile` when writing secrets, configurations, or encrypted backups.

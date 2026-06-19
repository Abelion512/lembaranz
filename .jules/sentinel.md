# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2024-05-18 - Prevent CWE-732 Insecure File Permissions in `fs.writeFile`
**Vulnerability:** Files written with `fs.writeFile` without explicit permissions will use the system's default permissions (usually `0o666` modified by the umask), which might allow unauthorized local users to read sensitive files.
**Learning:** `fs.writeFile` allows you to pass an options object as the third argument to set explicitly restrictive permissions such as `0o600`.
**Prevention:** Always use `{ mode: 0o600 }` when calling `fs.writeFile` to write sensitive data or configuration files like `.env` profiles or `.lembaranz` encrypted backup files.

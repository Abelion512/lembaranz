# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2026-06-22 - [Insecure File Permissions (CWE-732) Mitigation]
**Vulnerability:** Found multiple instances where sensitive files (like `.env` and `.lembaranz` encrypted backup exports) were created using `fs.writeFile` without explicit permission boundaries.
**Learning:** In Node.js, `fs.writeFile` defaults to `0o666` (read/write for everyone) modified by the user's `umask`. If a user's `umask` is overly permissive (e.g., `000` or `002`), sensitive files on the filesystem could be read or modified by other local users, posing a critical data leak risk for credentials and secrets.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using file writing APIs for sensitive configuration and backup files to ensure they are strictly limited to the file owner.

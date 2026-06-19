# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-05-18 - [HIGH] Fix Insecure File Permissions (CWE-732)
**Vulnerability:** The application was using `fs.writeFile` without explicitly setting restrictive file permissions when saving sensitive files such as `.env` configurations and `.lembaranz` vault backups. This defaults to 0o666 (minus umask), which may allow unauthorized local users to read sensitive credentials on multi-user systems.
**Learning:** Even though encryption handles data rest security, plain text keys, environment variables, and local data files must be protected at the file-system level. The lack of explicit modes during file writes exposes sensitive data to CWE-732 (Insecure File Permissions).
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for any file containing sensitive configuration, backups, or credentials.

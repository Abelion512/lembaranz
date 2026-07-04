# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2026-06-26 - Insecure File Permissions in Data Writing
**Vulnerability:** Found `fs.writeFile` being used without explicit restrictive file permissions for sensitive `.env` configurations and encrypted vault backups in `Context.ts`, `Config.ts`, and `TerminalUI.ts`.
**Learning:** Default file creation permissions (`0o666` modified by the system umask) are typically too permissive (`0o644` or `0o664`) for sensitive secrets or configuration files, potentially allowing unauthorized local users to read them.
**Prevention:** Always explicitly set restrictive file permissions, such as `{ mode: 0o600 }`, when writing sensitive data files using `fs.writeFile` or similar filesystem APIs to prevent CWE-732 vulnerabilities.

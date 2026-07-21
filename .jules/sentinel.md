# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-05-24 - Fix Insecure File Permissions in File Creation (CWE-732)
**Vulnerability:** Calls to `fs.writeFile` in `Context.ts`, `Config.ts`, and `TerminalUI.ts` created sensitive files (like `.env` and `.lembaranz` backup files) without explicitly setting file permissions, leading to files being created with default permissions (often `0o666` minus umask) which can allow unauthorized local users to read sensitive credentials and configurations.
**Learning:** Default file creation permissions in Node.js are determined by the system umask. For files containing sensitive information, relying on the system default is insecure as it may inadvertently grant read access to other local users.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` encrypted backups, ensuring only the owner can read/write them.

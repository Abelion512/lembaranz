# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2024-06-25 - Prevent Command Injection via exec()
**Vulnerability:** The `packages/cli/src/commands/Dashboard.ts` command used `exec(cmd)` to execute a local dashboard development server using string interpolation. User-supplied arguments like `--host` and `--port` were interpolated directly into the `cmd` string, allowing for command injection if a malicious user executed the command with manipulated options.
**Learning:** Node's `child_process.exec()` spawns a shell and runs commands within it, making it inherently vulnerable to command injection if arguments are not sanitized.
**Prevention:** Always use `child_process.spawn()` with `shell: false` (the default) and pass arguments as an array rather than interpolating them into a single command string. This guarantees that arguments are passed safely directly to the executable rather than being parsed by a shell.

## 2026-09-18 - Insecure File and Directory Permissions (CWE-732)
**Vulnerability:** Sensitive files like `.env`, vault files, and directories containing configuration/secrets were being created with default OS permissions, which could be too permissive and allow other local users to access them.
**Learning:** Default `fs.writeFile` and `fs.mkdir` behavior relies on `umask`, which might not be sufficiently restrictive (e.g., 0o022 means 0o644 for files).
**Prevention:** Always explicitly provide `{ mode: 0o600 }` for sensitive files and `{ mode: 0o700 }` for sensitive directories when using `fs` modules.

## 2026-07-27 - [Fix XSS Bypass via Double Encoding in safeMarked]
**Vulnerability:** XSS bypass possible in safeMarked because isDangerousUrl only single-pass decoded URLs, allowing attackers to double URL encode malicious javascript: URIs.
**Learning:** Single-pass decoding is insufficient for security filters. Attackers can layer encodings (like double URL encoding) to bypass regex signatures.
**Prevention:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop (e.g., while loop) to recursively unescape all layers of encoding.

## 2026-09-25 - [Insecure File/Directory Permissions]
**Vulnerability:** Files and directories containing sensitive data were created with default permissions, which may allow unauthorized local access.
**Learning:** Default Node.js filesystem APIs do not automatically restrict access.
**Prevention:** Always explicitly set restrictive permissions (`{ mode: 0o600 }` for files, `{ mode: 0o700 }` for directories) when creating files or folders that handle sensitive data to prevent CWE-732.

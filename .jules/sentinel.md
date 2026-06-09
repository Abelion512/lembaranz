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

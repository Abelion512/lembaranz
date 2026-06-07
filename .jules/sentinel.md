# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## $(date +%Y-%m-%d) - Prevent Command Injection via `spawn` instead of `exec`
**Vulnerability:** Found `child_process.exec` being used to start the Vite dev server in `packages/cli/src/commands/Dashboard.ts`. The inputs from `--host` and `--port` CLI options were being string-interpolated into the shell command string, allowing potential command injection (e.g., `--host "0.0.0.0 && rm -rf /"`).
**Learning:** Using `exec` with string interpolation of user-provided options is a critical Command Injection vector.
**Prevention:** Replaced `exec` with `child_process.spawn`. Set `shell: false` to disable shell interpolation. Used `String(options.port)` to safely cast arguments into an argument array rather than a single string command.

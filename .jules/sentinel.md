# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## Cross-Platform Command Execution without Shell
When enforcing `shell: false` in `child_process.spawn` to prevent command injection, executable commands (like `bun`, `npm`, `yarn`) may throw `ENOENT` on Windows. This is because these commands are often `.cmd` or `.bat` scripts on Windows, which require a shell to execute. To mitigate this securely without reverting to `shell: true`, dynamically resolve the executable name based on the OS (e.g., `os.platform() === 'win32' ? 'bun.cmd' : 'bun'`).

# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-04-18 - [Insecure File Permissions (CWE-732) on Sensitive Exports]
**Vulnerability:** `fs.writeFile` was used without explicit modes for sensitive files (`.env` and `.lembaranz` backup exports), allowing default permissions (0o666 minus umask) which risks local unauthorized read access.
**Learning:** Default Node.js file system APIs do not assume security. When exporting credentials or encrypted backup vaults, explicit `0o600` modes must be enforced consistently across all CLI/TUI and core modules.
**Prevention:** Always pass `{ mode: 0o600 }` (or similar restrictive modes) in the options object when calling `fs.writeFile` for any file containing secrets or PII.

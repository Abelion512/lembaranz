# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-07-24 - Double Encoding XSS Bypass
**Vulnerability:** The `isDangerousUrl` function in the markdown renderer used a single-pass decoding logic to filter out dangerous URL protocols like `javascript:`. This could be bypassed using multiple layers of encoding, such as double URL-encoding.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must recursively unescape all layers of encoding (e.g. double URL encoding). Single-pass decoding is insufficient.
**Prevention:** Use an iterative decoding loop to recursively unescape all layers of encoding until the string stabilizes (with a max depth to avoid DoS).

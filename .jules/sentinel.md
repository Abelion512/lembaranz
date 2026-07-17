# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-02-09 - [Preventing Double-Encoded XSS Bypasses]
**Vulnerability:** XSS filters using single-pass decoding can be bypassed by double URL encoding or mixed encoding (e.g., HTML entities inside URL encoding).
**Learning:** Attackers encode malicious payloads multiple times because the browser may perform recursive decoding natively, while naive filters only decode once and fail to match the signature.
**Prevention:** Use an iterative loop (e.g., up to 5 times) to repeatedly decode and unescape input until it stabilizes before validating for dangerous schemes like `javascript:`.

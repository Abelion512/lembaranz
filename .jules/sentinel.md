# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-06-23 - [HIGH] Fix XSS Bypass in safeMarked via Double Encoding
**Vulnerability:** The Markdown `isDangerousUrl` check was vulnerable to XSS bypass via double-encoded URLs (e.g., `%256A%2561...` for `javascript:`).
**Learning:** Single-pass URL decoding is insufficient for security filters because browsers will often recursively decode or handle double-encoded payloads in certain contexts. Attackers can bypass naive regex checks by adding multiple layers of encoding.
**Prevention:** Always use an iterative decoding loop (e.g., `for (let i = 0; i < 5; i++) { ... }`) to unescape all layers of URL/HTML encoding before evaluating a string against security blocklists.

# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2026-07-01 - [Double-Encoding XSS Bypass in Markdown Sanitizer]
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability existed in the `isDangerousUrl` function in `safeMarked.ts` where a malicious user could bypass the URL protocol filter (e.g., `javascript:`) by double URL encoding or using mixed HTML/URL encoding.
**Learning:** Single-pass URL decoding is insufficient for security filters because attackers can layer encodings (like `%256A` or `&#x25;6A`) that resolve to dangerous payloads after the initial pass.
**Prevention:** Always use an iterative decoding loop that recursively unescapes all layers of encoding (e.g., up to 5 loops) until the string stabilizes, ensuring no deeply embedded malicious signatures bypass the filter.

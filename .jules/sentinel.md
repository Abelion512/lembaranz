# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2025-07-03 - Markdown XSS via Double Encoding Bypass
**Vulnerability:** The Markdown sanitization logic in `safeMarked.ts` was vulnerable to XSS due to insufficient URL decoding. It decoded URLs only once before verifying against dangerous protocols like `javascript:`, allowing an attacker to bypass the filter using double or multiple URL encoding (e.g., `%256A` for `j`).
**Learning:** Security filters parsing complex inputs (like URLs in Markdown) must recursively or iteratively decode their inputs. Single-pass decoding is insufficient because adversaries can nest encodings (URL, HTML entity) to evade signature-based detection.
**Prevention:** Implement an iterative decoding loop (up to a defined maximum, such as 5) that repeatedly applies `decodeURIComponent` and HTML entity unescaping until the string stops changing, and evaluate the final decoded string against the dangerous protocol blocklist.

# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2025-02-21 - [HIGH] XSS Vulnerability via Double Encoding Bypass
**Vulnerability:** The Markdown rendering utility (`safeMarked.ts`) was vulnerable to Cross-Site Scripting (XSS) via a double-encoding bypass. Attackers could evade the `isDangerousUrl` filter by double-encoding malicious URLs (e.g. `%256Aavascript:alert(1)` or `&#x25;6Aavascript:alert(1)`).
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop to recursively unescape all layers of encoding (e.g. double URL encoding or mixed HTML/URL encoding). Single-pass decoding is insufficient and allows attackers to bypass filters.
**Prevention:** Always use a recursive or iterative decoding loop with a maximum depth limit (e.g., 5 loops) before checking strings against dangerous protocols or signatures to effectively mitigate layered encoding evasion.

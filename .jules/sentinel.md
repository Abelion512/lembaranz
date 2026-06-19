# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2024-05-20 - XSS Bypass via Double Encoding
**Vulnerability:** The Markdown link rendering in `safeMarked.ts` attempted to block dangerous URLs (e.g., `javascript:`) but only applied a single pass of `decodeURIComponent` and HTML entity decoding. This allowed attackers to bypass the filter by double URL encoding (`%256A` -> `%6A` -> `j`) or combining URL and HTML entity encoding.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures can be bypassed if the decoding is not comprehensive. Attackers often use multiple layers of encoding (e.g., double URL encoding, or mixing HTML entities and URL encoding) to evade single-pass filters.
**Prevention:** Always use an iterative decoding loop (e.g., `while (decoded !== previous && loopCount < MAX_ITERATIONS)`) to recursively unescape all layers of encoding until the string reaches a stable, fully-decoded state before evaluating it against security blacklists. Ensure a maximum iteration limit (like 5) to prevent infinite loop DoS attacks.

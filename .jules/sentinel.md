# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-05-18 - XSS evasion via double-encoding in Markdown parser
**Vulnerability:** The `isDangerousUrl` function in `safeMarked.ts` only performed a single pass of URI and HTML entity decoding when checking for malicious protocols (e.g., `javascript:`).
**Learning:** This allowed an attacker to bypass the security check by double-encoding the malicious payload (e.g., `%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)`), which would only be partially decoded by the single pass, evading the check, but still executed by the browser.
**Prevention:** Always use an iterative decoding loop (e.g., up to 5 times) to recursively unescape all layers of encoding until the string stops changing, ensuring that deeply nested encodings are fully neutralized before validation.

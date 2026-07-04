# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2025-02-27 - Double/Multiple Encoding XSS Bypass
**Vulnerability:** The Markdown rendering function `isDangerousUrl` iteratively checked decoded URLs to sanitize XSS, but it previously decoded it only once. This allowed double encoded URIs (`%256A%2561...` which decodes to `%6A%61...` which then decodes to `javascript:...`) or multiple encodings to bypass the filter.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop to recursively unescape all layers of encoding.
**Prevention:** Implement a recursive or iterative decoding limit (e.g. up to 5 times or until decoding no longer changes the string) to prevent multiple encoded injections.

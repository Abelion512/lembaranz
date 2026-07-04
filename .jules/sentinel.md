# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2024-06-30 - Fix XSS bypass via double-encoded URLs in markdown
**Vulnerability:** The `isDangerousUrl` function in `safeMarked.ts` used a single-pass decoding approach (only once) for URLs when filtering for dangerous protocols like `javascript:`. Attackers could bypass this by double-encoding malicious URLs (e.g. `%256Aavascript:`).
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must recursively unescape all layers of encoding (e.g. up to a limit like 5 loops). Single-pass decoding is insufficient and allows evasion techniques like double encoding or mixed encoding. Also initializing the decoded fallback (`let decoded = url;`) avoids potential issues if decodeURIComponent throws on malformed URIs.
**Prevention:** Always use an iterative decoding loop (up to a fixed number of iterations to prevent DoS) when validating inputs against malicious signatures. Ensure error fallbacks provide a baseline safe value (e.g. initialing with the original string) rather than returning undefined or skipping validation.

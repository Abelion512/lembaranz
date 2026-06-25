# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.

## 2023-10-24 - Double URL Encoding XSS Bypass in Custom Markdown Renderer
**Vulnerability:** XSS bypass was possible in `safeMarked.ts` because `isDangerousUrl` only decoded the URL string once. Payloads heavily encoded multiple times (e.g., Double URL Encoding like `%256A%2561%2576...` for `javascript:`) would slip past the blacklist check and be outputted securely verbatim as an `href` attribute, which the browser would then double-decode and execute.
**Learning:** Single-pass decoding is insufficient for robust security sanitization of HTML attributes when users control the input. Attackers combine various encoding schemes (like mixing HTML entities with multiple layers of URL encoding) to obfuscate malicious signatures.
**Prevention:** Implement an iterative decoding strategy with a set limit (e.g., 5 loops) and an early breakout when the string stops mutating. This recursively unescapes all layers of encoding and verifies the final base layer for dangerous patterns.

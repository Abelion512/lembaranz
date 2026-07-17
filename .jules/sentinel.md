# Security Learnings

## URL Parsing & OS Command Injection Mitigation
To prevent command injection, shell executions must use `child_process.spawn` with `shell: false` rather than `exec`, passing user inputs/URLs as an argument array. For URLs specifically, strictly validate by parsing with `new URL()` and enforcing safe protocols (e.g., `https:`, `http:`) before passing `parsed.href` to native openers (like `open`, `xdg-open`, or `explorer`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2024-07-06 - XSS Double Encoding Bypass in safeMarked

**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `packages/dashboard/lib/safeMarked.ts` where malicious URLs like `%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)` could bypass the protocol filtering logic.
**Learning:** The `isDangerousUrl` function only decoded URLs once. Attackers could evade the `javascript:` check by double-encoding the URI components (e.g. `%256A` -> `%6A` -> `j`).
**Prevention:** Implement an iterative decoding loop that runs until the decoded output no longer changes (bounded to a max number of iterations like 5 to prevent DoS) before applying protocol denylists or regex tests.

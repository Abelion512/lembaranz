
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

## 2025-02-12 - [Unsanitized Environment Variables Execution in CLI Config]
**Vulnerability:** Unsanitized keys and values from `.env` files loaded dynamically via `Config.ts run` were directly passed to `spawn()`. This allowed the potential injection of non-POSIX keys or control characters via the environment payload.
**Learning:** Parsing plaintext configurations directly into OS environment dictionaries without strict boundary validation creates injection vectors, particularly when used to spawn local commands dynamically.
**Prevention:** Always validate configuration keys against standard POSIX conventions (e.g. `/^[a-zA-Z_][a-zA-Z0-9_]*$/`) and aggressively strip out control characters (`/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`) from values before merging them into `process.env`.

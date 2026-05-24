
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

## 2024-03-05 - [High] Prevent Markdown XSS Evasion via Encoded Payloads
**Vulnerability:** The Markdown renderer (`safeMarked.ts`) mitigated XSS by performing a simple regex check (`dangerousSchemes.test(href)`) directly on the raw URL string. This was bypassable using basic URI encoding (e.g., `javascript%3A`), HTML entity encoding (e.g., `&#x6A;avascript:`), or control character evasion (e.g., `java\nscript:`), leading to script execution vulnerabilities on dynamically rendered `.md` pages.
**Learning:** Checking for dangerous URL schemes using Regex is unreliable against evasion techniques because HTML entities and percent-encoded characters are evaluated natively by the browser before navigation, bypassing exact-string matches on the raw backend.
**Prevention:** Always deeply decode payloads (both HTML unescaping and URI decoding) and strip whitespace/control characters recursively before verifying the safety of a protocol/scheme against an allowlist or denylist regex.


## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.
## 2025-05-21 - Hardened XSS Protection in safeMarked.ts
**Vulnerability:** The markdown renderer (`safeMarked.ts`) relied on a naive regex (`/^(javascript|data|vbscript|file):/i`) to block dangerous URL schemes. This was bypassable via URL encoding (e.g. `javascript%3A`), HTML entity encoding (e.g. `&#x6A;avascript:`), and whitespace padding (e.g. ` javascript:`).
**Learning:** Naive regexes against user-controlled URLs are insufficient for XSS protection because marked/markdown parsers will pass the encoded/spaced string exactly as is into the HTML output, where the browser will then happily decode and execute the payload. The evaluation of dangerous schemes must decode the input and strip evasive characters first.
**Prevention:** Implement a decoding helper (`isDangerousUrl`) that actively decodes HTML entities and URIs, and strips whitespaces/control characters before validating against the dangerous scheme list. Additionally, fallback mechanisms (manual byte iteration) are required if standard decoding (`decodeURIComponent`) throws an error on malformed URIs to prevent the check from failing open.

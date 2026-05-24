
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

## 2024-05-15 - [XSS Filter Bypass in Markdown Links/Images]
**Vulnerability:** The `dangerousSchemes` regex filter (`/^(javascript|data|vbscript|file):/i`) in `packages/web/lib/safeMarked.ts` could be bypassed by inserting whitespace (e.g. ` javascript:`), URL encoding (`javascript%3A`), HTML entity encoding (`javascript&#58;`), or control characters (`\x0Bjavascript:`) before or inside the scheme in Markdown link and image definitions.
**Learning:** Marked parses the text but doesn't always fully decode or strip whitespace before passing it to custom renderers. A regex testing for `^` (start of string) fails if even a single space or control character precedes the scheme. Relying purely on simple regex matching against the raw `href` property is insufficient for XSS prevention.
**Prevention:** Always normalize the URL before filtering. An effective normalization function should: 1) unescape HTML entities, 2) decode URI components, and 3) strip all whitespace and control characters (e.g. `url.replace(/[\x00-\x20]+/g, '').toLowerCase()`) prior to executing the schema validation regex.

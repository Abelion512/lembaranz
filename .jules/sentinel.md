
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

## 2024-03-05 - [Fix XSS Bypass in Markdown Link Scheme Validation]
**Vulnerability:** The regex used to sanitize dangerous links in `packages/web/lib/safeMarked.ts` (`/^(javascript|data|vbscript|file):/i`) could be easily bypassed by using HTML entities (e.g., `javascript&#58;`), URL encodings (e.g., `%6A...`), or whitespace padding (e.g., ` javascript:`).
**Learning:** Checking for malicious URL schemes in markdown rendering must involve decoding entities, URL components, and aggressively removing all whitespaces and control characters prior to testing against the scheme pattern. Otherwise, XSS payloads in markdown links can bypass superficial validation.
**Prevention:** Implement a robust pre-processing function (e.g., `isDangerousUrl`) that decodes `decodeURIComponent`, resolves `&#x` and `&#` entities, decodes string representations like `&colon;`, and strips `[\x00-\x20]+` characters before applying the schema validation regex on all external user-supplied or rendered URLs.

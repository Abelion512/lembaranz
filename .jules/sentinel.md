
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.

<<<<<<< HEAD
## 2024-03-05 - [Fix XSS Bypass in Markdown Link Scheme Validation]
**Vulnerability:** The regex used to sanitize dangerous links in `packages/web/lib/safeMarked.ts` (`/^(javascript|data|vbscript|file):/i`) could be easily bypassed by using HTML entities (e.g., `javascript&#58;`), URL encodings (e.g., `%6A...`), or whitespace padding (e.g., ` javascript:`).
**Learning:** Checking for malicious URL schemes in markdown rendering must involve decoding entities, URL components, and aggressively removing all whitespaces and control characters prior to testing against the scheme pattern. Otherwise, XSS payloads in markdown links can bypass superficial validation.
**Prevention:** Implement a robust pre-processing function (e.g., `isDangerousUrl`) that decodes `decodeURIComponent`, resolves `&#x` and `&#` entities, decodes string representations like `&colon;`, and strips `[\x00-\x20]+` characters before applying the schema validation regex on all external user-supplied or rendered URLs.

## 2025-05-24 - [Harden Environment Variable Sanitization in Vault Context Injection]
**Vulnerability:** The environment variable injection logic in `packages/cli/src/commands/Config.ts` (`run` command) previously lacked strict validation for environment variable keys and values, potentially allowing key injection or the passing of dangerous control characters (e.g., null bytes).
**Learning:** Overly broad blocklists (e.g., stripping all keys starting with `NODE_` or `LD_`) can cause critical regressions by inadvertently removing standard variables like `NODE_ENV` or `LDAP_URL`. Value sanitization must also be careful not to strip standard whitespace control characters (`\t`, `\n`, `\r`) which are often necessary for multi-line configurations like RSA keys.
**Prevention:** Implement strict regex validation for keys (`/^[a-zA-Z_][a-zA-Z0-9_]*$/`), use an explicit and targeted blocklist (`DANGEROUS_ENV_KEYS`) for dangerous keys rather than broad prefixes, and safely strip only non-whitespace control characters (`/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`) from values.

## 2026-05-19 - [XSS Bypass via URI decoding errors and Entity Obfuscation]
**Vulnerability:** The Markdown renderer's `isDangerousUrl` validation could be bypassed using payloads like `jav ascript:` or HTML entities `javascript&#58;`. Furthermore, an initial fix attempt to decode these using `decodeURI` introduced a critical bypass where an attacker could pass malformed URIs (e.g. `%`), crashing `decodeURI`, falling back to the raw entity string, and bypassing the scheme check while still rendering perfectly in the DOM.
**Learning:** In Javascript, `decodeURI` throws a `URIError` when encountering malformed sequences. If you catch this error and fail open (return the original encoded string), it creates an evasion vector. The system must fail securely by returning the stripped but unescaped string, effectively dropping the malformed bits but persisting the decoded payload, so validation regex can detect it.
**Prevention:** Always ensure parsing failure conditions fail securely (fail-closed/fail-safe) rather than falling back to the raw, unvalidated input.
=======
## 2024-05-15 - [XSS Filter Bypass in Markdown Links/Images]
**Vulnerability:** The `dangerousSchemes` regex filter (`/^(javascript|data|vbscript|file):/i`) in `packages/web/lib/safeMarked.ts` could be bypassed by inserting whitespace (e.g. ` javascript:`), URL encoding (`javascript%3A`), HTML entity encoding (`javascript&#58;`), or control characters (`\x0Bjavascript:`) before or inside the scheme in Markdown link and image definitions.
**Learning:** Marked parses the text but doesn't always fully decode or strip whitespace before passing it to custom renderers. A regex testing for `^` (start of string) fails if even a single space or control character precedes the scheme. Relying purely on simple regex matching against the raw `href` property is insufficient for XSS prevention.
**Prevention:** Always normalize the URL before filtering. An effective normalization function should: 1) unescape HTML entities, 2) decode URI components, and 3) strip all whitespace and control characters (e.g. `url.replace(/[\x00-\x20]+/g, '').toLowerCase()`) prior to executing the schema validation regex.
>>>>>>> origin/sentinel-xss-markdown-renderer-bypass-16497817062873301670

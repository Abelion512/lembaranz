
## 2025-05-24 - [Fix XSS via Unescaped Markdown Links and Images]
**Vulnerability:** The `safeMarked` utility in `packages/web/lib/safeMarked.ts` did not filter image protocols and failed to properly escape attributes like `href` on links.
**Learning:** This oversight allows an attacker to inject XSS payloads using specially crafted URLs for links/images (e.g., `![x](javascript:alert(1))` or `[x](https://x.com"onmouseover="alert(1)")`) even when raw HTML is stripped.
**Prevention:** Always implement a full custom renderer that not only filters dangerous protocols but comprehensively escapes HTML characters (`<`, `>`, `"`) from user-provided URLs and titles.
## 2025-05-24 - [Harden Environment Variable Sanitization in Vault Context Injection]
**Vulnerability:** The environment variable injection logic in `packages/cli/src/commands/Config.ts` (`run` command) previously lacked strict validation for environment variable keys and values, potentially allowing key injection or the passing of dangerous control characters (e.g., null bytes).
**Learning:** Overly broad blocklists (e.g., stripping all keys starting with `NODE_` or `LD_`) can cause critical regressions by inadvertently removing standard variables like `NODE_ENV` or `LDAP_URL`. Value sanitization must also be careful not to strip standard whitespace control characters (`\t`, `\n`, `\r`) which are often necessary for multi-line configurations like RSA keys.
**Prevention:** Implement strict regex validation for keys (`/^[a-zA-Z_][a-zA-Z0-9_]*$/`), use an explicit and targeted blocklist (`DANGEROUS_ENV_KEYS`) for dangerous keys rather than broad prefixes, and safely strip only non-whitespace control characters (`/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`) from values.

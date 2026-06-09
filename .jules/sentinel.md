# Sentinel: Fix XSS Evasion in safeMarked.ts

**Issue:** The `isDangerousUrl` function in `packages/dashboard/lib/safeMarked.ts` was vulnerable to Cross-Site Scripting (XSS) evasion via double encoding. It only decoded the URL once, meaning an attacker could provide a double-encoded payload (e.g., `%256A` which decodes once to `%6A`, bypassing the `javascript:` regex check, and later executed by the browser).

**Fix:** Updated the function to use an iterative decoding loop. It now continuously decodes the URL (up to 5 times) until it is fully decoded (when `decoded === previous`). This ensures that deeply nested encodings are fully unrolled before the protocol regex check is applied.

**Testing:** Added a test case `harus menetralkan link jahat yang dienkode URL ganda (double-encoded XSS)` in `packages/dashboard/lib/__tests__/safeMarked.test.ts` to verify the fix blocks payloads like `%256A%2561...`.

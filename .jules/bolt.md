# Bolt's Journal - Performance Learnings

## 2024-03-09 - [Performance Optimization: Hex String to Uint8Array Conversion]
**Learning:** Hex string to Uint8Array conversion can be heavily bottlenecked by string manipulation functions like `substring()` and `parseInt()`. Using `charCodeAt` with bitwise math to extract numeric values directly from character codes `((c & 0xf) + (c >> 6) * 9)` completely avoids intermediate string allocations, providing up to a 4-5x speedup for hex parsing, which is critical for decryption paths.
**Action:** When implementing hex parsing loops, use `charCodeAt` and bitwise arithmetic rather than standard library string functions.

## 2024-03-09 - [Performance Optimization: Constant-Time String Comparison]
**Learning:** In `constantTimeCompare`, using `new TextEncoder().encode()` incurs significant overhead due to object allocation and UTF-8 encoding iteration. We can avoid this and achieve up to a ~30x speedup by iterating over the string directly with `.charCodeAt(i)`.
**Action:** When performing constant-time string comparisons for security purposes, use direct character code iteration (`charCodeAt`) instead of allocating intermediate byte arrays via `TextEncoder`.

## 2026-05-24 - [Structural i18n & Context Optimization]
**Learning:** React Context providers often become performance bottlenecks when they recreate their 'value' object on every render. This triggers re-renders across all consumer components, regardless of whether the actual state changed. Additionally, defining large static objects like translation dictionaries inside the render loop (as seen in `DocsLayout.tsx`) adds significant allocation overhead and prevents engine-level optimizations.
**Action:** Always memoize context values with `useMemo` and functions with `useCallback`. Move static configuration and translation data outside component definitions to ensure they are only allocated once.

## 2026-05-24 - [TUI Search & List Optimization]
**Learning:** In terminal UIs (TUI) like Ink, the render loop is triggered on every keystroke. Performing expensive operations like regex-based text cleaning and string lowercasing inside a `filter` loop (O(N*M) complexity) causes noticeable typing lag. Additionally, using `JSON.stringify` to detect changes in large lists inside a `useEffect` adds significant overhead, especially when combined with unmemoized array mappings in parent components.
**Action:** Pre-compute searchable tokens and cleaned text when data is first loaded. Memoize derived list items for selection components. Use lightweight heuristics (length + stable key check) instead of full serialization for change detection in list components.

## 2024-03-09 - [Performance Optimization: Large Buffer to Base64 Serialization]
**Learning:** Using `btoa(String.fromCharCode(...new Uint8Array(data)))` directly throws a "Maximum call stack size exceeded" error when handling large ArrayBuffers, such as parsing file backups or encryption keys. Also `Array.from()` carries performance overhead when chunking. Casting subarrays to `number[]` inside an iterative chunking logic completely eliminates memory overflow and safely computes Base64 payloads efficiently.
**Action:** Always implement chunked loop serialization (`String.fromCharCode.apply`) for raw byte array conversions instead of raw spread operations (`...`) to prevent runtime call stack size violations.

## 2024-05-18 - FileAdapter Concurrency Discovery
**Learning:** While exploring the codebase, I discovered that the `restoreBackup` loop in `Archive.ts` is sequential and extremely slow (taking ~10.5s for 1000 notes). Crucially, the underlying `FileAdapter.ts` implements a safe `savePromise`/`nextSavePromise` queue for atomic writes. This means it is entirely safe to parallelize saving multiple notes concurrently using `Promise.all` without risking database corruption, yielding a ~40x speedup in isolated benchmarks (~250ms).
**Action:** When working on backups or large imports, don't assume sequential `await` is required for safety if the adapter handles locking. Parallelizing `saveNote` calls is safe and highly recommended for future PRs.
## 2024-07-23 - Prevent call stack size exceeded during base64 encoding
**Learning:** Using `String.fromCharCode(...new Uint8Array(buffer))` on large buffers exceeds the maximum call stack size in JavaScript/TypeScript because the spread syntax passes each byte as a separate argument. While a naive loop works, it is slow and allocates strings iteratively.
**Action:** Chunk the array into manageable sizes (e.g., 8192 bytes) and use `String.fromCharCode.apply(null, chunk)`, joining the chunks at the end before running `btoa()`. This prevents call stack limits and runs significantly faster than a character-by-character iterative loop.

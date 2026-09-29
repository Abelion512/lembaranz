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
## 2024-05-18 - Vault Hex Conversion Optimization
**Learning:** The string padding approach `Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')` for hex conversion is highly inefficient due to massive intermediate array allocations and string creation.
**Action:** Always prefer direct pre-allocated arrays and bitwise shifting (`HEX_CHARS[v >> 4]` and `HEX_CHARS[v & 15]`) for buffer transformations.
## 2024-05-18 - FileAdapter Concurrency Discovery
**Learning:** While exploring the codebase, I discovered that the `restoreBackup` loop in `Archive.ts` is sequential and extremely slow (taking ~10.5s for 1000 notes). Crucially, the underlying `FileAdapter.ts` implements a safe `savePromise`/`nextSavePromise` queue for atomic writes. This means it is entirely safe to parallelize saving multiple notes concurrently using `Promise.all` without risking database corruption, yielding a ~40x speedup in isolated benchmarks (~250ms).
**Action:** When working on backups or large imports, don't assume sequential `await` is required for safety if the adapter handles locking. Parallelizing `saveNote` calls is safe and highly recommended for future PRs.
## 2024-07-23 - Prevent call stack size exceeded during base64 encoding
**Learning:** Using `String.fromCharCode(...new Uint8Array(buffer))` on large buffers exceeds the maximum call stack size in JavaScript/TypeScript because the spread syntax passes each byte as a separate argument. While a naive loop works, it is slow and allocates strings iteratively.
**Action:** Chunk the array into manageable sizes (e.g., 8192 bytes) and use `String.fromCharCode.apply(null, chunk)`, joining the chunks at the end before running `btoa()`. This prevents call stack limits and runs significantly faster than a character-by-character iterative loop.
## 2026-09-18 - [Bulk Backup Restore Optimization]
**Learning:** The `restoreBackup` process used a sequential await loop to save notes, which was a significant performance bottleneck. The underlying `FileAdapter` natively handles safe queueing of writes via promises, meaning concurrent writes are safe.
**Action:** Parallelized the saving of notes during backup restoration using `Promise.all` with a chunk size of 50, reducing execution time significantly without risking database corruption.

## 2026-08-03 - Bulk DB Import Optimization
**Learning:** For bulk database imports (like restoreBackup in packages/core/src/Archive.ts), chunked parallel processing (Promise.all with chunkSize = 50) provides massive speedups (from ~3000ms down to ~550ms for 500 records) because the underlying FileAdapter safely queues concurrent writes without causing unbounded concurrency issues like Out-Of-Memory (OOM) or SQLite BUSY errors.
**Action:** Use Promise.all chunking for bulk database imports instead of sequential await to significantly improve performance.

## 2026-07-26 - Backup Restore Parallelization
**Learning:** Bulk database operations like restoring backups shouldn't always use sequential await. In this codebase, the FileAdapter queue safely handles atomic writes without BUSY errors. Parallelizing them using Promise.all chunking provides massive speedups.
**Action:** Use Promise.all chunking for large batch writes when the underlying storage handles atomic queues.

## 2026-07-24 - [Archive Restore Bulk Import Optimization]
**Learning:** The sequential `for` loop in `restoreBackup` was causing significant performance bottlenecks during large imports. By utilizing a chunked `Promise.all` approach (e.g., chunks of 50) and taking advantage of `FileAdapter`'s native save/nextSavePromise queuing for atomic writes, we can safely parallelize saving multiple notes concurrently without risking database corruption, yielding massive speedups.
**Action:** When working on backups or large imports, prefer chunked parallel processing (`Promise.all`) instead of sequential `await`. It safely maximizes throughput as long as the underlying adapter handles atomic writes.

## 2024-07-22 - Chunked Parallel Processing for Bulk Imports
**Learning:** The underlying FileAdapter safely queues concurrent writes without causing unbounded concurrency issues like Out-Of-Memory (OOM) or SQLite BUSY errors.
**Action:** For bulk database imports (like `restoreBackup`), utilize chunked parallel processing (e.g., Promise.all with chunkSize = 50) rather than sequential await to achieve massive speedups.

## 2024-05-18 - [Parallel Chunking in Bulk Imports]
**Learning:** When performing bulk database operations (like restoring backups), sequential `await` loops are unnecessarily slow. Using `Promise.all` with a chunk size (e.g., 50) leverages the underlying `FileAdapter`'s ability to queue concurrent writes safely without risking SQLite database corruption, resulting in massive speed improvements.
**Action:** Apply chunked `Promise.all` parallelization for batch database writes rather than standard sequential loops.

## 2024-05-24 - [Archive Backup Restore Optimization]
**Learning:** Sequential saving in `restoreBackup` causes massive bottlenecks when importing large datasets due to awaiting each save operation. Because the underlying storage layer (`FileAdapter`) handles file locks and queues writes safely, we don't need to await each save sequentially in the application logic.
**Action:** Use chunked parallel execution (e.g. `Promise.all` with a chunk size of 50) for bulk database operations when the adapter is known to handle concurrent write requests safely, as it can yield massive speedups (~40x).

## 2024-05-18 - [Parallel Bulk Database Imports]
**Learning:** Sequential awaits for database imports cause massive IO bottlenecks. The underlying `FileAdapter` implements a safe `savePromise` queue for atomic writes, meaning it's safe to parallelize saving multiple items.
**Action:** When working on backups or large imports, utilize chunked parallel processing (`Promise.all` with a chunk size, e.g., 50) rather than sequential `await` to achieve massive speedups without risking database corruption.
## 2024-05-18 - [Performance Optimization: FileAdapter Concurrency in restoreBackup]
**Learning:** Sequential `await` loops for database operations (like `restoreBackup` in `Archive.ts`) can be a massive bottleneck. Because the underlying `FileAdapter` implements a safe `savePromise`/`nextSavePromise` queue for atomic writes, we can safely parallelize saving multiple notes concurrently using `Promise.all` without risking database corruption or out-of-memory/BUSY errors. This chunking pattern yielded a ~40x speedup in isolated benchmarks (~250ms).
**Action:** For bulk database imports or backups, use chunked parallel processing (`Promise.all` with a reasonable chunk size like 50) rather than sequential `await` if the underlying adapter safely handles locking.

## 2024-05-18 - [FileAdapter Concurrency Discovery]
**Learning:** The `restoreBackup` loop in `Archive.ts` was sequential and slow. The underlying `FileAdapter.ts` implements a safe `savePromise`/`nextSavePromise` queue for atomic writes, making it safe to parallelize saving multiple notes concurrently using `Promise.all` with a chunk size of 50 without risking database corruption or OOM/SQLite BUSY errors.
**Action:** When working on backups or large imports, don't assume sequential `await` is required for safety if the adapter handles locking. Parallelizing `saveNote` calls is safe and highly recommended for future PRs.
## 2024-07-13 - [Vault - Optimized Base64 Conversion]
**Learning:** Using `btoa(String.fromCharCode(...new Uint8Array(data)))` for large arrays throws `Maximum call stack size exceeded`. Additionally, chunked conversion (`String.fromCharCode.apply(null, chunk)`) provides ~2.5x performance improvement.
**Action:** Use chunking (8192 bytes) and `String.fromCharCode.apply` when converting large Uint8Array to Base64 to prevent stack limits and improve performance.

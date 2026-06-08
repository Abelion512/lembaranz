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

## 2024-06-08 - [Performance Optimization & Safety: btoa Stack Size & Base64 Chunking]
**Learning:** Using `btoa(String.fromCharCode(...new Uint8Array(data)))` is highly unsafe for large datasets (e.g., payloads > 125KB) because the JavaScript spread operator `...` passes elements as individual arguments, triggering a "Maximum call stack size exceeded" error. Additionally, memory allocation for `Array.from()` is very slow. A chunked loop (e.g., 8192 byte blocks) combined with `String.fromCharCode.apply` casting the subarray to `number[]` is necessary to safely encode large ArrayBuffers into Base64 while retaining maximum performance.
**Action:** Always avoid `String.fromCharCode(...bytes)` for variable-sized data. Use chunked loop execution for large Uint8Array conversions.

## 2024-06-08 - [Performance Optimization: Hex String Encoding]
**Learning:** `Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')` is a massive bottleneck due to array allocations and multiple callback iterations. Replacing this with a simple string concatenation loop using a pre-allocated static lookup table (`HEX_CHARS = '0123456789abcdef'`) and bitwise operations (`HEX_CHARS[v >> 4] + HEX_CHARS[v & 15]`) yields up to a ~4x speedup for Uint8Array-to-Hex conversions without needing Node-specific buffers.
**Action:** Never use `.map().join('')` with `Array.from` for performance-critical byte-to-hex conversions. Use static tables and bit-shifting logic in a tight `for` loop.

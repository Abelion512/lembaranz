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

## 2024-11-20 - [Performance Optimization: Uint8Array to Hex String Conversion]
**Learning:** `Uint8Array` to hex string conversion is often bottlenecked by standard library functions mapping over the array to convert items to string one by one. Converting each byte individually using `.toString(16).padStart(2, "0")` inside a map function allocates a lot of strings and arrays. Using a predefined 16-character string (`HEX_CHARS = '0123456789abcdef'`) alongside a plain `for` loop and bitwise operations (`(v >> 4)` and `(v & 15)`) to map nibbles to characters can yield a ~3-4x performance improvement, largely due to reduced intermediate object allocation overhead. We found that this string loop was faster than lookup table options due to initialization overhead in Node.
**Action:** When converting byte arrays to hex strings, use bitwise arithmetic to map into a predefined character set string instead of mapping and joining values.

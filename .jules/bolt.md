## 2025-06-17 - Optimize restoreBackup I/O Bottleneck
**Learning:** Sequential async operations (like the original `for...of` await saveNote loop) create severe bottlenecks when processing cryptographically and I/O heavy operations. However, sending an unbounded array to `Promise.all` causes memory exhaustion (OOM) and SQLite/File lock contention (BUSY errors).
**Action:** When parallelizing operations that require file I/O or database access, use a chunked array slice technique with `Promise.all` (e.g. chunks of 50) to balance high throughput with system stability.

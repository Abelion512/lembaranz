1. Add `bytesToBase64` method to `packages/core/src/Vault.ts` that safely chunks `Uint8Array` to string before `btoa`, using 8192 bytes chunks and `String.fromCharCode.apply(null, chunk)` for performance and safety.
2. Replace all instances of `btoa(String.fromCharCode(...new Uint8Array(...)))` in `packages/core/src/Vault.ts` and `packages/core/src/Archive.ts` with `Vault.bytesToBase64(...)`.
3. Add a journal entry to `.jules/bolt.md` reflecting on this learning (chunking `Uint8Array` to base64 to avoid max call stack size, optimizing performance and memory).
4. Run `bun run lint` and `bun test` to verify changes.
5. Create a PR with `submit` using the specified format for Bolt persona.

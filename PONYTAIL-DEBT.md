# PONYTAIL-DEBT.md

Tech-debt ledger harvested from `ponytail:` markers. Regenerate with `/ponytail-debt`
(scan: `grep -rnE '(#|//) ?ponytail:' .` skipping `node_modules`, `.git`, and build output).

## packages/core/src/Audit.ts

- `Audit.ts:54`, single-process ledger append. **ceiling:** concurrent writers could fork the hash chain. **upgrade:** storage-level lock if multi-writer support arrives.

## packages/core/src/storage/FileAdapter.ts

- `FileAdapter.ts:104`, whole-document rewrite per mutation. **ceiling:** `saveNote` costs 2 writes (~1.0 ms each on a 435 KB document) and grows linearly with vault size. Coalescing the note and audit writes into one was built and measured at 2.8 ms -> 6.6 ms per save, so the write stays immediate. **upgrade:** append-only log or per-store file if write cost dominates a measured workflow.

## packages/core/src/Vault.ts

- `Vault.ts:23`, decryption cache capped at 4096 plaintext entries per session. **ceiling:** any cap below one full vault scan (~3 fields per note) makes FIFO eviction thrash on sequential reads — a cap of 256 against 300 notes pushed `getAllNotes` from 3.5 ms to 16.5 ms. **upgrade:** drop the cache for a decrypted-vault snapshot invalidated on write, if plaintext retention in memory becomes unacceptable.

## packages/dashboard/src/main.tsx

- `main.tsx:30`, path-based routing in one `Root` component. **ceiling:** no nested routes, no params. **upgrade:** react-router when routes grow.

---

**4 markers, 0 with no trigger.**

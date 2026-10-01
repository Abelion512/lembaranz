# PONYTAIL-DEBT.md

Tech-debt ledger harvested from `ponytail:` markers. Regenerate with `/ponytail-debt`
(scan: `grep -rnE '(#|//) ?ponytail:' .` skipping `node_modules`, `.git`, and build output).

## packages/core/src/Audit.ts

- `Audit.ts:81`, single-process ledger append. **ceiling:** concurrent writers could fork the hash chain. **upgrade:** storage-level lock if multi-writer support arrives.

## packages/dashboard/src/main.tsx

- `main.tsx:27`, path-based routing in one `Root` component. **ceiling:** no nested routes, no params. **upgrade:** react-router when routes grow.

---

**2 markers, 0 with no trigger.**

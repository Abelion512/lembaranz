import { Storage } from "./Storage";
import { Integrity } from "./Integrity";
import { EntityId } from "./Formula";
import { v4 as uuidv4 } from "uuid";

export type AuditAction =
  | "VAULT_SETUP"
  | "VAULT_UNLOCK"
  | "PASSWORD_RESET"
  | "KDF_UPGRADED"
  | "NOTE_CREATED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED"
  | "SECURITY_ALERT"
  | "DOCTOR_FIX";

export interface AuditEntry {
  id: EntityId;
  timestamp: string;
  action: AuditAction;
  details: string;
  metadata?: Record<string, unknown>;
  /** Monotonic ledger position (1-based) — makes ordering deterministic. */
  seq?: number;
  /**
   * Hash of the previous hashed entry (chain link). Absent on entries written
   * before the tamper-evident ledger was introduced.
   */
  prevHash?: string | null;
  /** SHA-256 over { seq, id, timestamp, action, details, prevHash }. */
  hash?: string;
}

export interface LedgerVerification {
  ok: boolean;
  /** Entries covered by the hash chain. */
  checked: number;
  /** Pre-ledger entries (no hash) accepted for backward compatibility. */
  legacy: number;
  /** First entry whose link or hash does not verify. */
  brokenAt?: EntityId;
}

/** Storage key prefix for ledger entries inside the `kv` store. */
const LEDGER_PREFIX = "audit_";

/**
 * Serializes ledger appends. The chain is a read-modify-write over the whole
 * ledger (read head -> seq/prevHash -> hash -> write), so two overlapping
 * callers can read the same head and commit sibling entries with identical
 * seq + prevHash, which permanently breaks verifyChain(). Callers such as
 * Archive.restoreBackup save notes in parallel, so appends must queue.
 *
 * ponytail: module-level queue = one chain per JS realm, which is all a
 * single-process vault has. Upgrade path: a storage-level lock if multi-writer
 * (multi-tab / multi-process) support ever arrives.
 *
 * NOTE: deliberately NOT declared as an object property named `Promise*`.
 * A class/interface-annotated `Promise` binding shadows the global `Promise`
 * across the module under Bun, breaking `Promise.all`/`new Promise` for every
 * consumer (all of Archive.ts). Keep this binding named `appendQueueTail`.
 */
let appendQueueTail: Promise<unknown> = globalThis.Promise.resolve();

const isAuditEntry = (value: unknown): value is AuditEntry => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuditEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.timestamp === "string" &&
    typeof candidate.action === "string"
  );
};

/**
 * Audit: append-only ledger with hash chaining (blockchain-style, local-only).
 *
 * Every entry commits to the hash of its predecessor, so editing, reordering,
 * or removing a covered entry breaks verification. There is no network and no
 * consensus layer by design: the chain proves local tamper-evidence, and
 * `headHash()` lets a user anchor the sequence externally if they want
 * truncation coverage too.
 */
export const Audit = {
  /**
   * Logs a new action to the tamper-evident audit trail.
   *
   * Appends are queued so the chain's read-modify-write stays atomic within
   * this process. A failed append must not poison the queue for later writes,
   * hence the rejection handler is duplicated rather than chained once.
   */
  async log(action: AuditAction, details: string, metadata?: Record<string, unknown>): Promise<void> {
    const run = appendQueueTail.then(
      () => this.append(action, details, metadata),
      () => this.append(action, details, metadata)
    );
    appendQueueTail = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  },

  async append(
    action: AuditAction,
    details: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      details,
      metadata
    };

    try {
      const previous = await this.lastHashedEntry();
      entry.seq = (previous?.seq ?? 0) + 1;
      entry.prevHash = previous?.hash ?? null;
      entry.hash = await this.hashEntry(entry);

      await Storage.set("kv", `${LEDGER_PREFIX}${entry.timestamp}_${entry.id}`, entry);

      if (process.env.DEBUG === "true") {
        console.log(`[AUDIT] ${entry.action}: ${entry.details}`);
      }
    } catch (e) {
      console.error("[AUDIT_ERROR] Failed to write log:", e);
    }
  },

  /**
   * Computes the chain hash of an entry (metadata excluded by data policy).
   */
  async hashEntry(entry: AuditEntry): Promise<string> {
    return Integrity.computeHash({
      seq: entry.seq ?? 0,
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      details: entry.details,
      prevHash: entry.prevHash ?? null
    });
  },

  /**
   * Returns every ledger entry, oldest first.
   */
  async listEntries(): Promise<AuditEntry[]> {
    try {
      const all = (await Storage.getAll("kv")) as unknown[];
      return all
        .filter(isAuditEntry)
        .sort(
          (a, b) =>
            (a.seq ?? 0) - (b.seq ?? 0) ||
            a.timestamp.localeCompare(b.timestamp) ||
            a.id.localeCompare(b.id)
        );
    } catch {
      return [];
    }
  },

  /**
   * Latest entry that carries a chain hash (the ledger head).
   */
  async lastHashedEntry(): Promise<AuditEntry | undefined> {
    const entries = await this.listEntries();
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].hash) return entries[i];
    }
    return undefined;
  },

  /**
   * Head hash. Record it somewhere external to also detect truncation, which a
   * purely local chain cannot see.
   */
  async headHash(): Promise<string | null> {
    const head = await this.lastHashedEntry();
    return head?.hash ?? null;
  },

  /**
   * Recomputes the chain and reports the first broken link.
   * Entries written before the ledger existed (no `hash`) are counted as legacy.
   */
  async verifyChain(): Promise<LedgerVerification> {
    const entries = await this.listEntries();
    let checked = 0;
    let legacy = 0;
    let previousHash: string | null = null;
    let previousSeq = 0;

    for (const entry of entries) {
      if (!entry.hash) {
        legacy++;
        continue;
      }
      if (entry.prevHash !== previousHash || entry.seq !== previousSeq + 1) {
        return { ok: false, checked, legacy, brokenAt: entry.id };
      }
      const recomputed = await this.hashEntry(entry);
      if (recomputed !== entry.hash) {
        return { ok: false, checked, legacy, brokenAt: entry.id };
      }
      previousHash = entry.hash;
      previousSeq = entry.seq ?? previousSeq + 1;
      checked++;
    }

    return { ok: true, checked, legacy };
  },

  /**
   * Retrieves all logs sorted by timestamp (newest first)
   */
  async getLogs(limit: number = 50): Promise<AuditEntry[]> {
    // Copy before reversing: listEntries() order is the chain order, and
    // mutating it in place would corrupt a caller's cached view.
    return [...(await this.listEntries())].reverse().slice(0, limit);
  }
};

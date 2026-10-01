import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import { Audit } from "../Audit";
import { Storage } from "../Storage";

/**
 * Regression cover for the ledger fork: Audit.log is a read-modify-write over
 * the whole ledger (read head -> seq/prevHash -> hash -> write). Concurrent
 * callers used to read the same head and commit sibling entries sharing one
 * seq + prevHash, which permanently broke verifyChain(). Callers such as
 * Archive.restoreBackup save notes in parallel, so this must hold under load.
 */
describe("Audit ledger concurrency", () => {
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "lembaranz-audit-conc-"));
    await Storage.initialize(path.join(tmpDir, "db.json"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  test("concurrent appends keep a single unbroken chain", async () => {
    const N = 60;
    await Promise.all(
      Array.from({ length: N }, (_, i) => Audit.log("NOTE_CREATED", `concurrent ${i}`))
    );

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(true);
    expect(verification.checked).toBe(N);
    expect(verification.brokenAt).toBeUndefined();

    const entries = await Audit.listEntries();
    expect(entries.length).toBe(N);

    // Every position must be unique and contiguous: no forks.
    const seqs = entries.map((e) => e.seq ?? 0);
    expect(new Set(seqs).size).toBe(N);
    expect(seqs).toEqual(Array.from({ length: N }, (_, i) => i + 1));

    // Each entry must link to its predecessor's hash.
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].prevHash).toBe(entries[i - 1].hash ?? null);
    }
  }, 60000);

  test("a failed append does not poison the queue for later writes", async () => {
    await Audit.log("VAULT_SETUP", "first");
    await Audit.log("NOTE_CREATED", "second");

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(true);
    expect(verification.checked).toBe(2);
  }, 30000);
});

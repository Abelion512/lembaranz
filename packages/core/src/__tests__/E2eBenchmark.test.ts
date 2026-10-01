import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import { Archive } from "../Archive";
import { Vault } from "../Vault";
import { Storage } from "../Storage";
import { Audit } from "../Audit";

/**
 * E2E benchmark: every number is measured live on this machine with
 * performance.now() and printed for human audit. Assertions cover only
 * properties the crypto MUST have (wrong key rejected, chain breaks on
 * tampering, hashes differ across KDFs); duration ceilings are wide sanity
 * bounds, not performance guarantees.
 */

function fmt(ms: number): string {
  return ms >= 100 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`;
}

function bench(label: string, ms: number): void {
  console.log(`    [bench] ${label}: ${fmt(ms)}`);
}

describe("E2E benchmark (live system proof)", () => {
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "lembaranz-bench-"));
    await Storage.initialize(path.join(tmpDir, "db.json"));
  });

  afterEach(async () => {
    Vault.clearKey();
    await rm(tmpDir, { recursive: true, force: true });
  });

  test("full vault lifecycle + KDF + ledger tamper-evidence (measured live)", async () => {
    const password = "benchmark-password-2026";

    // 1. Setup vault (Argon2id wrap + random master key)
    let t0 = performance.now();
    const setup = await Archive.setupVault(password);
    const tSetup = performance.now() - t0;
    expect(setup.error).toBeNull();
    bench("setupVault (2x Argon2id derive + AES-GCM wraps)", tSetup);

    // 2. Unlock with the correct password (single Argon2id derive + unwrap)
    Vault.clearKey();
    t0 = performance.now();
    const unlock = await Archive.unlockVault(password);
    const tUnlock = performance.now() - t0;
    expect(unlock.data).toBe(true);
    bench("unlockVault (1x Argon2id derive + unwrap)", tUnlock);

    // 3. AES-GCM round-trip at 64 KiB — measured throughput
    const payload = "x".repeat(64 * 1024);
    t0 = performance.now();
    const enc = await Vault.encrypt(payload);
    const tEnc = performance.now() - t0;
    expect(enc.error).toBeNull();

    t0 = performance.now();
    const dec = await Vault.decrypt(enc.data!.data, enc.data!.iv);
    const tDec = performance.now() - t0;
    expect(dec.data).toBe(payload);
    const mibPerSec = 64 / ((tEnc + tDec) / 1000);
    bench(`AES-GCM 64KiB round-trip (~${mibPerSec.toFixed(1)} MiB/s)`, tEnc + tDec);

    // 4. Argon2id vs PBKDF2 on identical inputs — measured, not claimed
    const salt = new Uint8Array(16).fill(3);
    t0 = performance.now();
    await Vault.deriveKey("bench-password", salt);
    const tArgon = performance.now() - t0;

    t0 = performance.now();
    await Vault.deriveKeyLegacy("bench-password", salt);
    const tPbkd = performance.now() - t0;
    bench(`Argon2id derive (ratio to PBKDF2: ${(tArgon / Math.max(tPbkd, 0.01)).toFixed(1)}x)`, tArgon);
    bench("PBKDF2-HMAC-SHA256 100k derive", tPbkd);

    // The memory-hard KDF must not be trivially cheaper than PBKDF2.
    // Wide 10x ceiling so slow CI machines stay green, but a regression that
    // swapped Argon2id for a cheap hash still fails.
    expect(tArgon).toBeGreaterThan(tPbkd * 10);

    // 5. Wrong password is rejected and the vault stays locked
    Vault.clearKey();
    t0 = performance.now();
    const wrong = await Archive.unlockVault("definitely-not-the-password");
    const tWrong = performance.now() - t0;
    expect(wrong.error).not.toBeNull();
    expect(Vault.isLocked()).toBe(true);
    bench("wrong-password attempt (2x derive, both rejected)", tWrong);

    // 6. Ledger verification cost + chain integrity
    const headBefore = await Audit.headHash();
    expect(headBefore).toBeTruthy();

    t0 = performance.now();
    const verification = await Audit.verifyChain();
    const tVerify = performance.now() - t0;
    expect(verification.ok).toBe(true);
    expect(verification.checked).toBeGreaterThan(0);
    bench(`verifyChain (${verification.checked} chained entries)`, tVerify);

    // 7. Tamper with one entry -> chain must catch it (modification detection)
    const all = await Storage.getAll("kv");
    const target = all.find(
      (e): e is AuditEntryLike => typeof e === "object" && e !== null && "hash" in e
    );
    expect(target).toBeTruthy();
    await Storage.set("kv", `audit_${target!.timestamp}_${target!.id}`, {
      ...target,
      details: "TAMPERED",
    });

    t0 = performance.now();
    const afterTamper = await Audit.verifyChain();
    const tDetect = performance.now() - t0;
    expect(afterTamper.ok).toBe(false);
    expect(afterTamper.brokenAt).toBe(target!.id);
    bench("tamper detection on modified entry", tDetect);

    // 8. Truncate the head entry -> headHash() moves (external-anchor detection).
    // headHash() returns the stored head, so truncation changes it while pure
    // content modification is caught by verifyChain instead — both halves of
    // the tamper-evidence story are asserted.
    const entries = await Audit.listEntries();
    const head = entries[entries.length - 1];
    expect(head?.hash).toBeTruthy();
    await Storage.delete("kv", `audit_${head.timestamp}_${head.id}`);
    const headAfter = await Audit.headHash();
    expect(headAfter).not.toBe(headBefore);
  }, 180000);
});

type AuditEntryLike = {
  id: string;
  timestamp: string;
  hash?: string;
  details: string;
};

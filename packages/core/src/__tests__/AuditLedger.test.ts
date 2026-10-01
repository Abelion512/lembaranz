import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import { Audit } from "../Audit";
import { Storage } from "../Storage";
import { Vault } from "../Vault";

describe("Audit ledger (hash chain)", () => {
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "lembaranz-audit-"));
    await Storage.initialize(path.join(tmpDir, "db.json"));
  });

  afterEach(async () => {
    Vault.clearKey();
    await rm(tmpDir, { recursive: true, force: true });
  });

  test("appends a verifiable chain and exposes a head hash", async () => {
    await Audit.log("VAULT_SETUP", "first");
    await Audit.log("NOTE_CREATED", "second");
    await Audit.log("NOTE_DELETED", "third");

    const entries = await Audit.listEntries();
    expect(entries.length).toBe(3);
    expect(entries[0].seq).toBe(1);
    expect(entries[0].prevHash).toBeNull();
    expect(entries[1].prevHash).toBe(entries[0].hash ?? null);
    expect(entries[2].prevHash).toBe(entries[1].hash ?? null);

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(true);
    expect(verification.checked).toBe(3);
    expect(verification.legacy).toBe(0);

    const head = await Audit.headHash();
    expect(head).toBe(entries[2].hash ?? null);
  }, 30000);

  test("detects a tampered entry", async () => {
    await Audit.log("VAULT_SETUP", "first");
    await Audit.log("NOTE_CREATED", "second");

    const entries = await Audit.listEntries();
    const target = entries[0];
    await Storage.set("kv", `audit_${target.timestamp}_${target.id}`, {
      ...target,
      details: "tampered",
    });

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(false);
    expect(verification.brokenAt).toBe(target.id);
  }, 30000);

  test("tolerates pre-ledger legacy entries", async () => {
    await Storage.set("kv", "audit_legacy_entry", {
      id: "legacy-id",
      timestamp: "2020-01-01T00:00:00.000Z",
      action: "NOTE_CREATED",
      details: "old entry without hash",
    });
    await Audit.log("VAULT_SETUP", "new entry");

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(true);
    expect(verification.legacy).toBe(1);
    expect(verification.checked).toBe(1);
  }, 30000);

  test("detects a broken link when a covered entry is removed", async () => {
    await Audit.log("VAULT_SETUP", "first");
    await Audit.log("NOTE_CREATED", "second");

    const entries = await Audit.listEntries();
    await Storage.delete("kv", `audit_${entries[0].timestamp}_${entries[0].id}`);

    const verification = await Audit.verifyChain();
    expect(verification.ok).toBe(false);
    expect(verification.brokenAt).toBe(entries[1].id);
  }, 30000);

  test("getLogs returns newest first", async () => {
    await Audit.log("VAULT_SETUP", "first");
    await Audit.log("NOTE_CREATED", "second");

    const logs = await Audit.getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].details).toBe("second");
  }, 30000);
});

/**
 * Dogfooding session: use Lembaranz the way a web-dashboard user does,
 * through the same public API calls as packages/dashboard/src/App.tsx.
 *
 * 1.  Fresh vault check (isVaultSetup)
 * 2.  Realistic data (10 mixed notes: creds + notes)
 * 3.  Save notes through saveNote (encryption at rest)
 * 4.  Reload them through getNoteById (decryption + integrity seals)
 * 5.  Search like the sidebar search box does
 * 6.  Edit one note (update path + re-seal)
 * 7.  Delete one note
 * 8.  Panic key set + trigger (kill switch end-to-end)
 * 9.  Rebuild a fresh vault, export a portable backup, restore it
 * 10. Verify the audit ledger caught the panic wipe + chain verifies
 *
 * Run: bun scripts/dogfood.ts   (uses a temp file vault, no network)
 */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Archive, Vault, Storage, Audit } from "../index";

test("24-step user journey: setup, notes, search, panic key, backup, ledger", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "lembaranz-dogfood-"));
  await Storage.initialize(join(tmp, "db.json"));

  let failures = 0;
  function check(label: string, ok: boolean, detail = ""): void {
    if (!ok) {
      failures++;
      console.log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
    }
    expect(ok, `${label}${detail ? ` (${detail})` : ""}`).toBe(true);
  }

  // ── 1. Fresh vault ──────────────────────────────────────────────
  const fresh = await Archive.isVaultSetup();
  check("fresh storage reports no vault yet", fresh === false);

  // ── 2. Setup with realistic data ───────────────────────────────
  const PASSWORD = "correct horse battery staple 42";
  const MNEMONIC = "legal winner thank year wave sausage worth useful legal general thank spot";
  const setup = await Archive.setupVault(PASSWORD, MNEMONIC);
  check("setupVault(password, mnemonic)", setup.error === null);
  const seeded = await Archive.isVaultSetup();
  check("vault now reports initialized", seeded === true);
  Vault.clearKey();

  // ── 3. Save notes like the editor does ─────────────────────────
  const unlock = await Archive.unlockVault(PASSWORD);
  check("unlockVault with the master password", unlock.data === true);

  const NOTES = [
    { title: "GitHub token (work)", content: "ghp_xDEMO0000000000000000000000000000", isCredentials: true },
    { title: "Server root password", content: "host: db01.internal\nuser: root\npass: Tr0ub4dor&3", isCredentials: true },
    { title: "Recovery codes", content: "1234-5678\n8765-4321\n1111-2222", isCredentials: true },
    { title: "Meeting notes 2026-09-28", content: "Roadmap: ship ledger verification in v0.3." },
    { title: "Seed backup location", content: "Steel plate in the safe, box 2.", isCredentials: true },
    { title: "Wifi guest", content: "SSID: guest-net / pass: coffeeshop2026", isCredentials: true },
    { title: "API notes", content: "Rate limit is 60/min; batch endpoints accept 50 ids." },
    { title: "Tax portal", content: "login: finance@corp.example / pass: autumn2026!", isCredentials: true },
    { title: "Ideas", content: "Argon2 params are tunable per context in a future release." },
    { title: "Hardware keys", content: "Two YubiKeys: primary on keyring, spare in the safe.", isCredentials: true },
  ];

  const savedIds: string[] = [];
  let saveOk = true;
  for (const n of NOTES) {
    const res = await Archive.saveNote({
      title: n.title,
      content: n.content,
      folderId: null,
      isPinned: false,
      isFavorite: false,
      isCredentials: n.isCredentials ?? false,
    });
    if (res.error) { saveOk = false; break; }
    savedIds.push(res.data.id);
  }
  check(`saveNote x${NOTES.length} (10 mixed entries)`, saveOk);

  // ── 4. Reload + decrypt + integrity ─────────────────────────────
  let reloadOk = true;
  let integrityOk = true;
  for (let i = 0; i < NOTES.length; i++) {
    const res = await Archive.getNoteById(savedIds[i]);
    const note = res.data as { content: string; _hash?: string } | null;
    if (!note || note.content !== NOTES[i].content) reloadOk = false;
    if (!note?._hash) integrityOk = false;
  }
  check("getNoteById round-trips all 10 notes (decrypt)", reloadOk);
  check("every stored entry carries an integrity seal", integrityOk);

  // on-disk ciphertext must not contain any plaintext secret
  const raw = await Storage.getAll("notes");
  const rawText = JSON.stringify(raw);
  const leaked = NOTES.filter(n => rawText.includes(n.content));
  check("ciphertext on disk contains no plaintext secret", leaked.length === 0, leaked.length ? `leaked: ${leaked.map(n => n.title).join(", ")}` : "0/10 plaintext");

  // ── 5. Search like the sidebar does ─────────────────────────────
  const all = await Archive.getAllNotes();
  const list = (all.data ?? []) as { title: string; content: string }[];
  const q = "token";
  const hits = list.filter(n => (n.title + n.content).toLowerCase().includes(q));
  check(`sidebar search "${q}" finds the right note`, hits.some(n => (n as { title: string }).title === NOTES[0].title));

  // ── 6. Edit one note (update + re-seal) ────────────────────────
  const edited = await Archive.saveNote({
    id: savedIds[3],
    title: NOTES[3].title,
    content: "Roadmap: ledger verification shipped, next is WebAuthn.",
    folderId: null,
    isPinned: true,
    isFavorite: false,
  });
  check("saveNote with existing id updates the note", edited.error === null);
  const afterEdit = (await Archive.getNoteById(savedIds[3])).data as { content: string; isPinned: boolean } | null;
  check("edited content + pinned flag round-trip", afterEdit?.content.includes("WebAuthn") === true && afterEdit?.isPinned === true);

  // ── 7. Delete one note ─────────────────────────────────────────
  await Archive.deleteNote(savedIds[9]);
  const listAfter = ((await Archive.getAllNotes()).data ?? []) as unknown[];
  check("deleteNote removes exactly one entry", listAfter.length === NOTES.length - 1);

  // ── 8. Panic key end-to-end ────────────────────────────────────
  // setPanicKey returns void (fire-and-forget in the dashboard too); a rejection
  // would surface as an unhandled error here.
  let panicSetFailed = false;
  try {
    await Archive.setPanicKey("my-panic-phrase-2026");
  } catch {
    panicSetFailed = true;
  }
  check("setPanicKey stores a kill switch", !panicSetFailed);
  Vault.clearKey();
  const wrongBeforePanic = await Archive.unlockVault("not-the-password");
  check("wrong password rejected pre-wipe", wrongBeforePanic.error !== null && wrongBeforePanic.data !== true);
  const panicUnlock = await Archive.unlockVault("my-panic-phrase-2026");
  check("panic phrase triggers instead of unlocking", panicUnlock.data === false);
  const emptyAfterPanic = await Archive.isVaultSetup();
  check("vault data destroyed after panic key", emptyAfterPanic === false);

  // ── 9. Portable backup round-trip ──────────────────────────────
  const setup2 = await Archive.setupVault("fresh-vault-password-9");
  check("fresh vault after wipe", setup2.error === null);
  const unlocked2 = await Archive.unlockVault("fresh-vault-password-9");
  check("unlock fresh vault", unlocked2.data === true);
  const reSeed = await Archive.saveNote({
    title: "before-backup",
    content: "survives the round trip",
    folderId: null,
    isPinned: false,
    isFavorite: false,
  });
  check("seed note before backup", reSeed.error === null);

  const allNotes2 = (await Archive.getAllNotes()).data ?? [];
  const payload = JSON.stringify(allNotes2);
  const backupRes = await Vault.encryptPortable(payload, "backup-passphrase-7");
  check("encryptPortable creates an encrypted backup", backupRes.error === null);

  const restored = await Vault.decryptPortable(backupRes.data!, "backup-passphrase-7");
  check("decryptPortable restores the payload (Argon2id KDF)", restored.data === payload);
  const wrongBackup = await Vault.decryptPortable(backupRes.data!, "wrong-backup-pass");
  check("wrong backup passphrase rejected", wrongBackup.error !== null);

  // ── 10. Audit ledger across the whole session ──────────────────
  const chain = await Audit.verifyChain();
  check("audit ledger chain verifies", chain.ok === true, `${chain.checked} chained, ${chain.legacy} legacy`);
  const actions = (await Audit.listEntries()).map(e => e.action);
  const hasPanic = actions.includes("SECURITY_ALERT");
  check("ledger recorded the panic-key alert", hasPanic);

  Vault.clearKey();
  rmSync(tmp, { recursive: true, force: true });
  if (failures > 0) throw new Error(`${failures} dogfood checks failed`);
}, 240000);

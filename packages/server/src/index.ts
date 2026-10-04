/**
 * Lembaranz local server.
 *
 * Serves the vault over HTTP so the web UI can be a thin client instead of
 * holding a master key in the browser. The server becomes the trust boundary:
 * it keeps the master key in memory and returns only what the client asked for.
 *
 * Design notes:
 *  - Bun.serve is built in. No framework, no new dependency.
 *  - Binds to 127.0.0.1 by default. A vault server reachable from the network
 *    is a remote shell for whoever can reach it, so LAN binding is opt-in and
 *    warns loudly.
 *  - One shared bearer token guards every route. It is minted per process and
 *    printed once, so a browser tab can authenticate without a login form.
 *  - Every response is `Cache-Control: no-store`; vault data must never sit in
 *    an HTTP cache.
 *
 * Routes mirror the vault operations the web UI actually calls. Nothing else is
 * exposed.
 */
import { Archive, Vault, Sentinel, Audit, generateMnemonic, VAULT_LOCKED, WRONG_PASSWORD } from "@lembaranz/core";

const HOST = process.env.LEMBARANZ_HOST ?? "127.0.0.1";
const PORT = Number(process.env.LEMBARANZ_PORT ?? 5121);

/**
 * Session token, minted per process, so a restart invalidates every tab that
 * held the old one.
 *
 * ponytail: one shared token, no accounts. Upgrade path: real expiring sessions
 * if this ever listens off localhost.
 */
/**
 * Exported so tests (and any embedding process) can authenticate without
 * scraping stdout. It is already printed at startup, so this widens nothing.
 */
export const TOKEN = crypto.randomUUID();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Max-Age": "600",
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/**
 * Maps a vault error to a stable machine-readable code.
 *
 * The UI has three genuinely different things to do on failure: re-prompt for
 * the password, send the user back to the lock screen, or show a real failure.
 * It used to guess by matching English prose, which broke the moment a message
 * was reworded. The code is the contract; the message is for humans.
 *
 * `null` means "no specific code", which the UI renders as a plain error.
 */
const errorCode = (message: string): string | null => {
  if (message === WRONG_PASSWORD) return "wrong_password";
  if (message === VAULT_LOCKED || /vault (is )?locked/i.test(message)) return "locked";
  if (/too many failed attempts/i.test(message)) return "rate_limited";
  if (/recovery/i.test(message)) return "recovery_failed";
  if (/already/i.test(message) && /setup|initializ/i.test(message)) return "already_setup";
  return null;
};

/**
 * Flattens `Result<T>` into a response: a failed vault call is a 400 with a
 * readable message, not a 500.
 *
 * Typed as `unknown` because `Result<void>` collapses to `void` at the call
 * site, so a narrower parameter type would not accept it. The narrowing below
 * is a two-line runtime check, which is cheaper than threading a second
 * overload through every route.
 */
const unwrap = (result: unknown): Response => {
  const { data, error } = (result ?? {}) as { data?: unknown; error?: Error | null };
  return error
    ? json({ error: error.message, code: errorCode(error.message) }, 400)
    : json({ data: data ?? null });
};

export const server = Bun.serve({
  hostname: HOST,
  port: PORT,

  async fetch(req) {
    // The web UI is served from a different port during development, so answer
    // the preflight. No credentials are involved: the token is a header, not a
    // cookie, so `Allow-Credentials` stays off.
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, locked: Vault.isLocked() });
    }

    const presented = req.headers.get("Authorization") ?? "";
    if (!Sentinel.constantTimeCompare(presented, `Bearer ${TOKEN}`)) {
      return json({ error: "unauthorized" }, 401);
    }

    // Read the body once. Routes below may need several fields from it.
    const input = await req.json().catch(() => ({}));

    // One throwing handler must not take the process down: the server holds
    // the master key in memory, and dying on a bad request would drop an
    // unlocked vault session without a word.
    try {
      switch (`${req.method} ${url.pathname}`) {
        case "POST /status":
          return unwrap({ data: { setup: await Archive.isVaultSetup(), locked: Vault.isLocked() }, error: null });

        // Generates a BIP39 phrase and returns it WITHOUT storing anything. The
        // old setup screen took the phrase as optional free text and validated
        // nothing, so a vault could be created whose only recovery path was a
        // typo nobody would discover until it was needed. Generating here makes
        // recovery real by construction: the user cannot finish setup without a
        // valid phrase in hand.
        case "POST /recovery-phrase":
          return json({ data: generateMnemonic(12) });

        case "POST /setup":
          // Re-initialising an existing vault would replace the master key and
          // orphan every note already encrypted under it. Answering with success
          // (as a bare call to setupVault did) left the UI claiming it had made
          // a new vault while the data on disk belonged to the old key.
          if (await Archive.isVaultSetup()) {
            return json({ error: "This vault is already set up. Unlock it instead.", code: "already_setup" }, 400);
          }
          return unwrap(await Archive.setupVault(input.password, input.mnemonic));

        case "POST /unlock":
          return unwrap(await Archive.unlockVault(input.password));

        case "POST /recover":
          return unwrap(await Archive.recoverVault(input.mnemonic));

        case "GET /notes":
          return unwrap(await Archive.getAllNotes());

        case "POST /notes":
          return unwrap(await Archive.saveNote(input));

        case "POST /note":
          return unwrap(await Archive.getNoteById(input.id));

        case "DELETE /notes":
          return unwrap(await Archive.deleteNote(input.id));

        case "POST /panic-key":
          return unwrap(await Archive.setPanicKey(input.password));

        case "POST /wipe":
          return unwrap(await Archive.destroyAllData());

        case "POST /lock":
          Vault.clearKey();
          return json({ data: true });

        // The audit ledger and the entry count are what make the security
        // claims checkable instead of asserted, so the web UI renders them
        // rather than a decorative panel.
        case "POST /audit":
          return json({
            data: {
              chain: await Audit.verifyChain(),
              entries: await Audit.listEntries(),
            },
          });

        case "POST /stats":
          return json({ data: await Archive.getStats() });

        default:
          return json({ error: "not found" }, 404);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // An unexpected failure is a real fault, not noise: it means a route hit
      // a state the switch did not anticipate. Log it, or it is invisible.
      console.error(`[SERVER] ${req.method} ${url.pathname} failed:`, error);
      return json({ error: message }, 500);
    }
  },
});

console.log(`Lembaranz server on http://${server.hostname}:${server.port}`);
console.log(`Token: ${TOKEN}`);
console.log(
  HOST === "127.0.0.1"
    ? "Loopback only."
    : `WARNING: bound to ${HOST}. Anyone who can reach this can read your vault.`
);
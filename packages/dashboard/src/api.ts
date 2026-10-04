/**
 * Typed client for the Lembaranz vault server.
 *
 * Mirrors the `Archive` result shape (`{ data, error }`) so the UI components
 * need no changes beyond swapping `Archive.x(...)` for `api.x(...)`. That keeps
 * the refactor honest: the master key lives in the server process, never in the
 * browser, so a compromised tab cannot read the vault.
 *
 * The bearer token is minted by the server at startup and pasted in once. It
 * is kept in `sessionStorage`, not `localStorage`, so closing the tab ends the
 * session.
 */
import type { AuditEntry, DecryptedNote, LedgerVerification, NoteInput } from "@lembaranz/core";

export type Result<T> = { data: T; error: null } | { data: null; error: ApiError };

/**
 * A failed request, carrying the server's machine-readable code.
 *
 * The old UI decided what to do next by matching on the English message, which
 * meant every reword broke a flow. `code` is the contract: `wrong_password`
 * re-prompts, `locked` returns to the lock screen, `rate_limited` explains the
 * wait. `null` is an unexpected failure and is shown verbatim.
 */
export interface ApiError extends Error {
  code: string | null;
}

const apiError = (message: string, code: string | null): ApiError =>
  Object.assign(new Error(message), { code });

const TOKEN_KEY = "lembaranz.token";
const BASE_KEY = "lembaranz.base";

/** Server origin. Defaults to the conventional local port. */
export const baseUrl = (): string => localStorage.getItem(BASE_KEY) ?? "http://127.0.0.1:5121";

export const token = (): string => sessionStorage.getItem(TOKEN_KEY) ?? "";

export const saveConnection = (origin: string, bearerToken: string): void => {
  localStorage.setItem(BASE_KEY, origin.replace(/\/$/, ""));
  sessionStorage.setItem(TOKEN_KEY, bearerToken);
};

export const isConnected = (): boolean => token().length > 0;

/**
 * Consumes a `lembaranz server` connect link from the URL fragment.
 *
 * The server prints `<web>/app#h=<origin>&t=<token>`. The fragment is the right
 * home for a credential: browsers never send it in a request or a Referer. It is
 * read once here and then removed with `replaceState`, so the token does not
 * survive in session history, does not leak if the page is screenshotted or
 * bookmarked, and is not re-read on a reload.
 *
 * Returns true when a connection was stored, so the caller can skip straight
 * to the lock screen instead of flashing the connect form.
 */
export const consumeConnectLink = (): boolean => {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const origin = params.get("h");
  const bearer = params.get("t");
  window.history.replaceState({}, "", window.location.pathname + window.location.search);

  if (!origin || !bearer) return false;
  saveConnection(origin, bearer);
  return true;
};

const request = async <T>(path: string, init?: RequestInit): Promise<Result<T>> => {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
        ...init?.headers,
      },
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      // The server answers `{ error, code }` for failures and `{ data }` for success.
      return {
        data: null,
        error: apiError(payload.error ?? `Request failed (${res.status})`, payload.code ?? null),
      };
    }
    return { data: payload.data as T, error: null };
  } catch (e) {
    // Almost always "server not running", which is worth saying plainly.
    return {
      data: null,
      error: apiError(
        `Cannot reach the vault server at ${baseUrl()}. Start it with "lembaranz server". (${
          e instanceof Error ? e.message : String(e)
        })`,
        "unreachable"
      ),
    };
  }
};

export const api = {
  /** Reaches the server without a token, used by the connect screen. */
  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl()}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  setup: (password: string, mnemonic?: string) =>
    request<null>("/setup", { method: "POST", body: JSON.stringify({ password, mnemonic }) }),

  unlock: (password: string) =>
    request<boolean>("/unlock", { method: "POST", body: JSON.stringify({ password }) }),

  recover: (mnemonic: string) =>
    request<boolean>("/recover", { method: "POST", body: JSON.stringify({ mnemonic }) }),

  listNotes: () => request<DecryptedNote[]>("/notes"),

  // POST, not GET: `fetch` rejects a GET with a body, and the id has to travel
  // somewhere.
  getNote: (id: string) =>
    request<DecryptedNote>("/note", { method: "POST", body: JSON.stringify({ id }) }),

  status: () => request<{ setup: boolean; locked: boolean }>("/status", { method: "POST" }),

  /** Chain verification plus the ledger itself, for the integrity view. */
  audit: () =>
    request<{ chain: LedgerVerification; entries: AuditEntry[] }>("/audit", { method: "POST" }),

  /** Entry and folder counts. */
  stats: () => request<{ notes: number; folders: number }>("/stats", { method: "POST" }),

  /** A fresh BIP39 recovery phrase, generated in the tab and shown once. */
  generateRecovery: () => request<string>("/recovery-phrase", { method: "POST" }),

  saveNote: (note: NoteInput) =>
    request<DecryptedNote>("/notes", { method: "POST", body: JSON.stringify(note) }),

  deleteNote: (id: string) =>
    request<null>("/notes", { method: "DELETE", body: JSON.stringify({ id }) }),

  lock: () => request<boolean>("/lock", { method: "POST" }),

  setPanicKey: (password: string) =>
    request<null>("/panic-key", { method: "POST", body: JSON.stringify({ password }) }),

  destroyAll: () => request<null>("/wipe", { method: "POST" }),
};
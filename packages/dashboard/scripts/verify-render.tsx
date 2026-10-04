/**
 * Renders the dashboard components to static HTML and asserts the new copy and
 * the new screens actually reach the DOM.
 *
 * Run with `bun run verify:render` from the repo root.
 *
 * It lives inside `packages/dashboard` rather than the root `scripts/` folder
 * because `react-dom` is a dependency of this package only: from the repo root
 * Bun cannot resolve `react-dom/server` and the harness dies before it renders
 * anything. Being in this package also keeps it out of the Vite bundle (it is
 * not under `src/`) and out of `tsc -b`, which only covers `src`.
 *
 * Every path is derived from `import.meta.dir`, so it works on any machine and
 * in CI without editing.
 */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import path from "path";

// `src/` is the sibling of this `scripts/` directory.
const SRC = path.join(import.meta.dir, "..", "src");

// The dashboard reads `localStorage` / `sessionStorage` at module scope (the
// origin default and the token), and Bun has neither. A tiny in-memory pair is
// enough to render, and it keeps this harness dependency-free.
const store = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  } as Storage;
};
Object.defineProperty(globalThis, "localStorage", { value: store(), writable: true, configurable: true });
Object.defineProperty(globalThis, "sessionStorage", { value: store(), writable: true, configurable: true });

// `api.ts` reads the connect link from `window.location` at module scope, so
// importing `App` in Bun throws without this. An empty hash is the honest
// default: it is what a visitor who did not arrive from `lembaranz server` has,
// and it makes `consumeConnectLink` return false and the app boot to the connect
// screen, which is the shell state worth auditing.
Object.defineProperty(globalThis, "window", {
  value: {
    location: { hash: "", pathname: "/", search: "", href: "http://localhost/" },
    history: { replaceState: () => {} },
  },
  writable: true,
  configurable: true,
});

const Landing = (await import(path.join(SRC, "Landing.tsx"))).default;
const { LockScreen } = await import(path.join(SRC, "LockScreen.tsx"));
const { ConnectScreen } = await import(path.join(SRC, "ConnectScreen.tsx"));
const { IntegrityPanel } = await import(path.join(SRC, "IntegrityPanel.tsx"));
const App = (await import(path.join(SRC, "App.tsx"))).default;
const i18n = (await import(path.join(SRC, "i18n.ts"))).default;

// Force English so the assertions below are about content, not the language
// detector guessing inside a headless process.
await i18n.changeLanguage("en");

const landing = renderToStaticMarkup(React.createElement(Landing, { onEnter: () => {} }));

// Seed a session token so LockScreen renders the real unlock screen instead of
// its "no server running" branch, then render both so both branches are covered.
sessionStorage.setItem("lembaranz.token", "e2e-token");
const unlock = renderToStaticMarkup(
  React.createElement(LockScreen, { hasVault: true, onUnlocked: () => {}, onDisconnect: () => {} })
);
sessionStorage.clear();
const notConnected = renderToStaticMarkup(
  React.createElement(LockScreen, { hasVault: true, onUnlocked: () => {}, onDisconnect: () => {} })
);

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};

/**
 * Short labels whose next SIBLING is a heading.
 *
 * `impeccable detect <path>` cannot find this one. It is not a bad class or a
 * bad token, it is a shape: a tracked label paragraph sitting directly above an
 * `<h2>`, which is the most recognisable silhouette of a generated landing
 * page. It only exists once the page is rendered, so it is only checkable here.
 *
 * The depth stack matters. A naive "next tag in the string" scan reads the
 * child of a wrapper as the sibling of its parent and reports pairs that do not
 * exist; this walks real open and close tags.
 */
const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link", "source"]);
const kickersAboveHeading = (html: string): string[] => {
  type Node = { tag: string; open: number; parent: number; text: string };
  const nodes: Node[] = [];
  const kids: number[][] = [];
  const stack: number[] = [];

  for (const m of html.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    if (m[1]) {
      stack.pop();
      continue;
    }
    const parent = stack.length ? stack[stack.length - 1]! : -1;
    const idx = nodes.length;
    nodes.push({ tag: m[2]!, open: m.index ?? 0, parent, text: "" });
    (kids[parent] ??= []).push(idx);
    if (!m[4] && !VOID_TAGS.has(m[2]!)) stack.push(idx);
  }

  return kids.flatMap((sibs) =>
    sibs.flatMap((i, at) => {
      const node = nodes[i]!;
      const next = nodes[sibs[at + 1]!];
      if (!next || !/^h[1-6]$/.test(next.tag) || /^h[1-6]$/.test(node.tag)) return [];
      const after = html.indexOf(">", node.open) + 1;
      const stop = html.indexOf("<", after);
      const text = html.slice(after, stop === -1 ? html.length : stop).trim();
      return text.length > 0 && text.length < 60 ? [`<${node.tag}> "${text.slice(0, 46)}" -> <${next.tag}>`] : [];
    })
  );
};

console.log("--- landing: the repositioned narrative ---");
check("states the passkey asymmetry", landing.includes("Passwords are becoming"));
check("states 'Secrets are not.'", landing.includes("Secrets are not."));
check("problem section present", landing.includes("secrets leaked on public GitHub"));
check("names the competitor comparison", landing.includes("Bitwarden / 1Password"));
check("has an honest limits section", landing.includes("What this is not"));
check("admits no browser autofill", landing.includes("does not autofill"));
check("has the expansion ladder", landing.includes("scoped credentials for AI agents"));
check("has the coerced-device answer", landing.includes("forced to hand over"));
check("old empty adjective hero is gone", !landing.includes("Offline-First."));

console.log("\n--- lock screen: the paths that were missing ---");
check("offers recovery", unlock.includes("Forgot your password"));
check("has a master password field", unlock.includes("Master password"));
check("says the key stays out of the tab", unlock.includes("never in this tab"));
check("blocks on a missing server with instructions", notConnected.includes("lembaranz server"));

console.log("\n--- generated-page shapes a static scan cannot see ---");
// Every screen, not just the landing page. The shape is a property of the
// design system rather than of one page: `.eyebrow` is shared, so the moment a
// vault screen puts one above a heading it inherits the same defect. A 32px
// icon button on the integrity tab is as much a defect as a small hero link, and
// this check is the same logic.
{
  // The vault screens are rendered here too, in the states they boot into.
  // IntegrityPanel holds no data in this harness and renders its empty frame,
  // which is the state a first-time visitor sees, so it is covered either way.
  const connect = renderToStaticMarkup(React.createElement(ConnectScreen, { onConnected: () => {} }));
  const integrity = renderToStaticMarkup(React.createElement(IntegrityPanel));
  // No token is set, so `App` boots to the connect screen. That is the state a
  // first-time visitor lands in, and it is the only one reachable without a live
  // server: with a token `VaultApp` waits on `POST /status` and renders a
  // 141-byte loading frame, which satisfies every rule here by being empty.
  // App's connected states are covered by `contrast.test.tsx` and
  // `touch-targets.test.tsx`, which render it against a stubbed server.
  const appShell = renderToStaticMarkup(React.createElement(App));

  const screens: [string, string][] = [
    ["landing", landing],
    ["lock (unlock)", unlock],
    ["lock (offline)", notConnected],
    ["connect", connect],
    ["integrity", integrity],
    ["app shell", appShell],
  ];

  for (const [name, html] of screens) {
    const kickers = kickersAboveHeading(html);
    check(`${name}: no label sits above a heading (${kickers.length})`, kickers.length === 0);
    if (kickers.length) console.log(kickers.map((k) => `        ${k}`).join("\n"));
  }

  // A screen that renders nothing would satisfy the rule above vacuously, which
  // is the failure this check already had twice: it was written for the landing
  // page alone and proved nothing about the five screens it never looked at, and
  // when they were added it passed `App` on a 141-byte loading frame.
  for (const [name, html] of screens) {
    check(`${name}: rendered enough to audit (${html.length} bytes)`, html.length > 800);
  }
}

console.log(`\nlanding markup: ${landing.length} bytes`);
console.log(`lock markup:    ${unlock.length} bytes`);
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

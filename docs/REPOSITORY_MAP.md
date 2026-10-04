# 📁 Repository Map

Every file and folder in the repository, what it does, and whether you need it.
Line counts are approximate and drift; treat them as orientation, not truth.

> **For Developers** — the narrative version is in [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md).
> This file is the exhaustive index. Anything absent from here is undocumented
> and should be treated as a gap.

---

## Top level

| Path | What it is |
|------|------------|
| `packages/` | The three publishable workspaces. See [Packages](#packages). |
| `docs/` | All prose documentation. See [docs/](#docs). |
| `scripts/` | Repository-level tooling. |
| `.github/` | CI workflows, issue templates, bot config. See [.github/](#github). |
| `.changeset/` | Changesets versioning config; `changeset version` / `changeset publish` drive releases. |
| `.claude/skills/` | Vendored agent skills (MIT, upstream credited in each SKILL.md). |
| `AGENTS.md` | Agent contract: language policy, verification commands, design gate, ponytail ladder. |
| `PONYTAIL-DEBT.md` | Tech-debt ledger harvested from `ponytail:` markers. |
| `CHANGELOG.md` | Release history. `[Unreleased]` at the top. |
| `README.md` | Project overview, bilingual (en base / zh secondary). |
| `SECURITY.md` | Security policy and disclosure process. |
| `PRIVACY.md` | Privacy policy. Zero-knowledge, no telemetry. |
| `TERMS.md` | Terms of use. |
| `CODE_OF_CONDUCT.md` | Contributor covenant. |
| `CONTRIBUTING.md` | Contribution workflow. |
| `SUPPORT.md` | Where to get help. |
| `PRD.md` | Product requirements. |
| `QUICK_REFERENCE.md` | Command and shortcut cheatsheet. |
| `llms.txt` | Machine-readable project summary for LLM tooling. Keep in sync with the code. |
| `context7.json` | Context7 MCP registry metadata. |
| `install.sh` | Source installer, curl-piped by the dashboard. |
| `Dockerfile` | CLI-only image; TUI entrypoint. |
| `compose.yaml` | Docker Compose wrapper mounting the vault volume. |
| `vercel.json` | Vercel build: `bun run build` into `packages/dashboard/dist`, SPA rewrite. |
| `package.json` | Bun workspace root. Owns every script; see [Scripts](#scripts). |
| `eslint.config.mjs` | Flat ESLint config. Ignores nested clones under `lembaranz/`. |
| `typedoc.json` | API doc generation into `docs/api/`. |
| `bun.lock` | Lockfile. |
| `.env.example` | Template for local environment variables. |
| `.gitignore` / `.npmignore` / `.agentignore` | Ignore rules for git, npm publish, and agent tooling. |

---

## packages/

Bun workspaces. `@lembaranz/core` is the engine, `@lembaranz/cli` is the terminal
interface, `@lembaranz/dashboard` is the web app. The dashboard is
`private: true` and is not published.

```
packages/
├── core/       @lembaranz/core       0.2.0   encryption, storage, audit
├── cli/        @lembaranz/cli        0.2.0   CLI + TUI + `server` command
├── server/     @lembaranz/server     0.2.0   local vault server for the web UI
└── dashboard/  (private)                      Vite + React web client
```

### Runtime shape

The vault lives in a server process. `lembaranz server` starts it on
`127.0.0.1:5121`, mints a bearer token, and prints both. The web UI asks for
that address and token on a connect screen, then talks to the server over
HTTP. The master key stays in the server process, so a browser tab never holds
it.

```
lembaranz server          <- holds the master key
  ^                 ^
  | CLI/TUI         | HTTP + bearer token
  |                 |
CLI (direct)     dashboard (browser)
```

### packages/core — the engine

No I/O of its own beyond the storage adapters. Every async API returns
`Result<T>` and never throws.

| File | Lines | Purpose |
|------|-------|---------|
| `src/Vault.ts` | 455 | Crypto engine. AES-GCM 256, Argon2id KDF, PBKDF2 legacy fallback, packed `ivHex|base64` format, portable `LMBR` backups, hex/base64 codecs, bounded plaintext cache. |
| `src/Archive.ts` | 753 | High-level vault operations. `setupVault`, `unlockVault`, `recoverVault`, `resetPassword`, note CRUD, backup export/restore, panic key. |
| `src/Audit.ts` | 225 | Tamper-evident hash-chained ledger. `log`, `verifyChain`, `headHash`. Serializes appends through a module-scope queue. |
| `src/Context.ts` | 222 | Vault path resolution (`personal` / `project`) and `.env` read/write. |
| `src/Sentinel.ts` | 178 | Rate limiting with lockout, constant-time compare, bounded store with LRU-style eviction. |
| `src/Password.ts` | 189 | BIP39 wordlist (2048 words, load-time verified), `generateMnemonic`, `validateMnemonicChecksum`, `validateMnemonic`. |
| `src/Formula.ts` | 80 | Shared types: `Result<T>`, `StoredNote`, `DecryptedNote`, `NoteInput`, `AppSettings`, `Folder`, `CredentialsData`. |
| `src/Storage.ts` | 80 | Storage facade. Picks `FileAdapter` (Node) or `BrowserAdapter` (web) and guarantees a single shared instance. |
| `src/AuditLog.ts` | 66 | Privacy/audit reporting, Node-only with a browser guard. |
| `src/Integrity.ts` | 39 | SHA-256 per-entry seals, excluding `_hash`, `_timestamp`, `updatedAt`. |
| `src/Senses.ts` | 17 | Web haptic feedback helper. |
| `src/index.ts` | 14 | Public barrel. Everything above is re-exported. |

#### packages/core/src/storage/

| File | Lines | Purpose |
|------|-------|---------|
| `FileAdapter.ts` | 223 | JSON-file store. Atomic write-temp-then-rename, file `0o600`, dir `0o700`, save queue, shared in-flight load. Node-only. |
| `BrowserAdapter.ts` | 68 | IndexedDB store for the web dashboard. Same interface, four object stores. |
| `FileAdapter.shim.ts` | 5 | Browser build stub that throws on construction, so bundlers never pull `fs` into the web bundle. |
| `types.ts` | 31 | `LembaranzSchema` (IndexedDB typed schema) and the `StorageAdapter` interface both adapters implement. |

#### packages/core/src/__tests__/

| File | Lines | Covers |
|------|-------|--------|
| `CryptoFuzz.test.ts` | 580 | Seeded fuzz of the crypto boundary: bit flips, truncation, extension, forged entries, seal sensitivity. |
| `BrowserAdapter.test.ts` | 517 | IndexedDB keyPath semantics, concurrency, quota failures, connection reuse. |
| `SentinelBoundary.test.ts` | 453 | Every attempt/window/lockout boundary pinned to the constant that defines it. |
| `Context.test.ts` | 445 | Legacy vault migrations (written first), path resolution, `.env` read/write, browser guard. |
| `ArchiveLifecycle.test.ts` | 407 | Backup create/restore, password reset, corrupt and malformed backups. |
| `Vault.test.ts` | 283 | Encrypt/decrypt round-trips, codecs, portable backups, cache behavior. |
| `AuditLog.test.ts` | 244 | Privacy log creation, `0o600` re-tightening, browser guard. |
| `Password.test.ts` | 190 | Wordlist integrity, BIP39 vectors, checksum typo detection, back-compat. |
| `Dogfood.test.ts` | 178 | Realistic end-to-end vault usage. |
| `KdfMigration.test.ts` | 194 | Argon2id and PBKDF2 vaults, re-wrap on unlock. |
| `Sentinel.test.ts` | 144 | Rate-limit windows, lockout, reset, store bounds. |
| `E2eBenchmark.test.ts` | 144 | Performance budgets on the real code paths. |
| `Archive.restoreBackup.test.ts` | 129 | Backup restore correctness. |
| `StorageIntegrity.test.ts` | 111 | Hex validation, packed-form detection, concurrent-load data loss. |
| `Integrity.test.ts` | 97 | Seal computation and metadata exclusion. |
| `AuditLedger.test.ts` | 94 | Chain links, `verifyChain`, legacy entries, `headHash`. |
| `Senses.test.ts` | 99 | Haptic helper. |
| `AuditConcurrency.test.ts` | 60 | Appends do not fork the chain under parallel callers. |
| `FileAdapter.test.ts` | 41 | Missing file, malformed JSON. |
| `SecurityHardening.test.ts` | 23 | Vault file is created `0o600`. |
| `UnlockRateLimit.test.ts` | — | `unlockVault` throttles guessing itself, resets on success, audits refusals. |

#### packages/core/src/scripts/

Development benchmarks and probes, not shipped. Run directly with `bun run`.

| File | Purpose |
|------|---------|
| `bench-archive.ts` | `Archive` throughput probe. |
| `bench-base64.ts` | `bytesToBase64` / `base64ToBytes` throughput. |
| `bench-base64-optimization.ts` | A/B of base64 encoding strategies. |
| `compare-vault.ts` | Diffs two vault files, used for migration checks. |
| `inject-perf-data.ts` | Seeds a vault with synthetic notes for perf runs (`bun run test:perf`). |
| `test-file-adapter.ts` | Manual `FileAdapter` exercise outside the test runner. |

### packages/cli — terminal interface

Commander.js commands, Ink/React TUI. Depends on `@lembaranz/core`.

| File | Lines | Purpose |
|------|-------|---------|
| `src/commands/Config.ts` | 543 | `config` command: show, get, set, vault profiles, pre-commit secret hook, isolated `run` with env injection. |
| `src/commands/Setup.ts` | 387 | `setup` wizard: master password, 12-word phrase display, optional word verification, recovery flow. |
| `src/commands/Doctor.ts` | 134 | `doctor` diagnostics. |
| `src/commands/Import.ts` | 100 | `import` bulk credential import. |
| `src/commands/Export.ts` | 54 | `export` encrypted portable backup. |
| `src/commands/Dashboard.ts` | 60 | `dashboard` spawns the Vite dev server. Uses `spawn` with an argv array, never `shell: true`. |
| `src/commands/Monitor.ts` | 36 | `monitor` system health and integrity. |
| `src/commands/Browse.ts` | 25 | `browse` searchable archive browser. |
| `src/commands/Launch.ts` | 32 | `launch` enters the TUI. |
| `src/commands/Security.ts` | 32 | `security` dashboard, audits, ledger status. |
| `src/commands/ImportErrors.ts` | 19 | Import error formatting helpers. |
| `src/main.ts` | 71 | Entry point. Command registration, `process.exit(1)` on fatal errors. |
| `src/utils.ts` | 60 | `prepareContext` (resolve path, initialize storage) and `openVaultCLI` (password prompt; delegates rate limiting to `Archive.unlockVault`). |

#### packages/cli/src/tui/

| File | Lines | Purpose |
|------|-------|---------|
| `App.tsx` | 206 | TUI root, screen routing, lock state. |
| `ArchiveScreen.tsx` | 195 | Note list and reading view. |
| `SecurityScreen.tsx` | 187 | Audit ledger and chain verification view. |
| `UnlockVaultScreen.tsx` | 182 | Password and recovery-phrase unlock, with the BIP39 checksum advisory. |
| `CarveScreen.tsx` | 121 | Panic-key carve flow (emergency wipe). |
| `MonitorScreen.tsx` | 111 | Health and integrity view. |
| `CredentialsScreen.tsx` | 101 | Credential entry form. |
| `SettingsScreen.tsx` | 77 | Vault settings. |
| `reporter.ts` | 70 | Crash report URL builder. Validates scheme and uses `spawn` with `shell: false`. |
| `StatusBar.tsx` | 58 | Bottom status bar. |
| `MainMenu.tsx` | 46 | Main menu. |
| `MessageBox.tsx` | 37 | Modal message box. |
| `WelcomeScreen.tsx` | 37 | First-run welcome. |
| `CrashScreen.tsx` | 66 | Crash handler screen. |
| `theme.ts` | 17 | `UI_TOKENS` colour tokens and `UI_SYMBOLS`. |
| `components/ModernSelect.tsx` | 162 | Keyboard-navigable list. |
| `components/CommandBarInput.tsx` | 74 | Command bar input. |
| `components/Header.tsx` | 20 | Screen header. |

#### packages/cli/src/__tests__/

| File | Covers |
|------|--------|
| `utils.test.ts` | `openVaultCLI` rate-limit reset behavior. |
| `commands/__tests__/Import.test.ts` | Import parsing. |
| `tui/__tests__/reporter.test.ts` | Crash report URL construction. |

### packages/server — vault server

The process that holds the master key for the web UI.

| File | Purpose |
|------|---------|
| `src/index.ts` | `Bun.serve` HTTP server. Loopback by default, bearer token compared in constant time, `Cache-Control: no-store`, per-route error boundary. |
| `src/__tests__/api.test.ts` | Auth boundary, cache headers, 404 and malformed-body handling, loopback binding, HTTP brute-force lockout. |

### packages/dashboard — web client

Vite + React + Tailwind, i18n `en` / `zh`. Talks to `packages/server` over
HTTP; it does not hold the master key. The vault route is `React.lazy` so
marketing visitors never download the vault UI at all.

One palette, one light source. Every colour and every font stack lives in
`tailwind.config.js` and `src/index.css`; no component contains a literal hex
value, and the one accent (sand) is the only accent in the product.

| File | Lines | Purpose |
|------|-------|---------|
| `src/App.tsx` | 439 | The vault workspace: entry rail, editor, clipboard wipe, tab semantics, 44px touch targets. |
| `src/Landing.tsx` | 618 | Marketing landing page. Static content, so it never downloads the crypto engine. |
| `src/LockScreen.tsx` | 379 | Create, unlock, and recover. The frame renders no interactive element on purpose (see `touch-targets.test.tsx`). |
| `src/ConnectScreen.tsx` | 114 | Collects the server address and bearer token before the vault UI renders. |
| `src/IntegrityPanel.tsx` | 136 | Live hash-chain verification and the ledger. |
| `src/main.tsx` | 60 | React entry, hash router, lazy vault route with a Suspense fallback. |
| `src/api.ts` | 158 | Typed HTTP client for the vault server. Mirrors the `Archive` result shape so UI call sites read the same. |
| `src/i18n.ts` | 34 | i18next setup, `en` and `zh` resources. |
| `src/locales/en.json` | 147 keys | English strings. Base language. |
| `src/locales/zh.json` | 147 keys | Simplified Chinese strings. Key set verified identical by test. |
| `src/index.css` | 188 | The design system: base type, `.btn` / `.eyebrow` / `.glass` / `.chip` components, section grounds, reveal animation. `.eyebrow` and `.chip` are sentence case; never `@apply uppercase` here (see `class-compile.test.ts`). Do not remove the Tailwind directives. |
| `tailwind.config.js` | 80 | The palette and the three font stacks. System fonts only: the product makes no network requests, so it must not fetch a webfont. |
| `vite.config.ts` | 16 | Vite config. |
| `scripts/verify-render.tsx` | 194 | Server-renders the landing, lock, connect, integrity and app shell and asserts the narrative and the recovery paths reach the DOM. Also asserts, on every one of those screens, that no short label sits directly above a heading, and that each rendered enough markup for that rule to mean something. |
| `public/install.sh` | — | Installer copy served by the dev and production builds. Keep in sync with the repo root. |

#### packages/dashboard/src/\_\_tests\_\_/

| File | Purpose |
|------|---------|
| `touch-targets.test.tsx` | Compiles the real stylesheet, renders every screen, and asserts every interactive control resolves to at least 44x44px. Also pins the control count on `ConnectScreen` (3) and the not-connected `LockScreen` (1). |
| `class-compile.test.ts` | Asserts every utility named in the source became a rule in the compiled stylesheet. Tailwind fails silently, so an off-scale opacity or an unknown colour would otherwise ship as nothing. Also asserts no rule reaches the page with `text-transform: uppercase`, and that no class suppresses the focus ring. |
| `locales.test.ts` | `en` and `zh` declare the same keys, the same array lengths, and no empty English string. |
| `contrast.test.tsx` | Renders every screen against the compiled stylesheet and asserts each run of text clears WCAG AA on its own composited background. Alpha colours (`text-ink/60`), translucent `.glass` cards and the gradient section grounds are all resolved to the pixels a browser would paint. Also asserts it measured a real page, because a suite that walks nothing reports nothing and passes. |
| `helpers/css.ts` | Compiles Tailwind once per worker and injects it into jsdom. |
| `helpers/touch.ts` | Reconstructs a control's box from the resolved cascade, since jsdom has no layout engine. |
| `helpers/contrast.ts` | WCAG colour maths: parses the computed colour (including the `var(--tw-*-opacity)` form jsdom leaves unresolved) and composites alpha and gradient washes down to the two opaque colours a ratio is defined between. |

---

## docs/

| File | Purpose |
|------|---------|
| `CODEBASE_GUIDE.md` | Narrative walkthrough of how the code works. Start here. |
| `RECOVERY_PHRASE.md` | How the 12-word phrase works, its entropy, and the BIP39 checksum. |
| `BEGINNERS_GUIDE.md` | Non-technical walkthrough. |
| `STRATEGY_2026.md` | Roadmap. |
| `indeks.json` | Documentation index. |
| `en/GETTING_STARTED.md` | English getting-started. |
| `en/cli.md` | CLI reference. |
| `en/security.md` | Security reference. |
| `api/` | TypeDoc-generated API reference. Regenerate with the `docs` script; do not hand-edit. |
| `arsip/` | Archive of superseded Indonesian design notes. Historical, not maintained. |

---

## .github/

| Path | Purpose |
|------|---------|
| `workflows/ci.yml` | Canonical gate: lint, design check, tests, typecheck, build. |
| `workflows/codeql.yml` | CodeQL for `actions` and `javascript-typescript`. |
| `workflows/dependency-review.yml` | Dependency review on PRs. |
| `workflows/osv-scanner.yml` | OSV vulnerability scan. The only individually authored scanner. |
| `workflows/docker-publish.yml` | Builds and signs the image on tags. |
| `workflows/npm-publish.yml`, `workflows/release.yml` | Changesets release paths. Both trigger on `main`; only one should publish. |
| `workflows/publish.yml` | GitHub Packages publish on `v*` tags. |
| `workflows/release-drafter.yml`, `stale.yml`, `label.yml`, `greetings.yml`, `summary.yml` | Repository community management. |
| `workflows/apisec-scan.yml`, `bearer.yml`, `codacy.yml`, `devskim.yml`, `ethicalcheck.yml`, `jfrog-sast.yml`, `semgrep.yml`, `snyk-security.yml`, `sonarcloud.yml`, `sonarqube.yml`, `security-scan.yml` | Third-party scanners from a bulk template import. See [Workflow audit](#workflow-audit) before relying on any of them. |
| `ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` | Issue and PR forms. |
| `dependabot.yml`, `labeler.yml`, `release-drafter.yml` | Bot configuration. |

### Workflow audit

23 of the 25 workflow files arrived in a single bulk merge on 2026-06-07, not
authored individually. Known problems, all verified against the code:

- `codeql.yml` and `security-scan.yml` both run `javascript-typescript` and
  both upload to the default category, so every alert is recorded twice.
- `npm-publish.yml` and `release.yml` both trigger on `main` and both publish
  through changesets. Their `concurrency` keys differ (they key off the
  workflow *name*), so they do not exclude each other.
- `codacy.yml` and `semgrep.yml` read secrets with no `!= ''` guard, so they
  fail on every push when the secret is absent. The other seven guard correctly.
- `apisec`, `ethicalcheck`, `bearer`, `jfrog-sast`, `codacy`, `snyk`,
  `semgrep`, `sonarcloud` and `sonarqube` are API scanners. The repository has
  no HTTP server; `grep` for `createServer|express(|app.listen` across
  `packages/*/src` returns nothing.
- `sonarqube.yml` has no `sonar-project.properties` to read.
- `ethicalcheck.yml` is already reduced to `workflow_dispatch` only because its
  upstream action is unpublished.

---

## scripts/

| File | Purpose |
|------|---------|
| `security-audit.ts` | Pre-publish guard. Fails if credential-shaped files are staged in a publishable package, or if the dashboard is not `private: true`. Wired to `prepublishOnly`. |

---

## Scripts

All defined in the root `package.json`.

| Script | Command |
|--------|---------|
| `cli` | `bun ./packages/cli/src/main.ts` |
| `test` | All three suites, core, CLI and server. |
| `test:core` | Core only. |
| `test:cli` | CLI only. |
| `test:server` | Server only. |
| `test:perf` | Seeds synthetic perf data. |
| `lint` | `eslint .` |
| `lint:design` | `impeccable detect packages/dashboard/src`. Source scan only: it cannot see a computed style, so the two rules a browser reports live in `verify:render` and `class-compile.test.ts` instead. |
| `security-audit` | `bun ./scripts/security-audit.ts` |
| `build` | Builds the dashboard. |
| `version-packages` | `changeset version` |
| `ci:release` | Security audit, then `changeset publish`. |
| `clean` | Removes `node_modules`. |

---

## Conventions

- **English is the base language** for identifiers, comments, CLI output, and
  docs. Simplified Chinese is secondary. Indonesian survives only in the legacy
  vault filenames `saku.json` and `pelataran.json`, which are migrated on read.
- **New code climbs the ponytail ladder** before adding anything: does it need
  to exist, does the codebase already have it, can the stdlib or a native
  platform feature cover it. Mark deliberate shortcuts with `ponytail:` and a
  ceiling.
- **No em dashes in user-facing copy.**
- **Interactive controls are at least 44px.**
- **Deliberate shortcuts carry a `ponytail:` marker** with a ceiling and an
  upgrade path, and are harvested into `PONYTAIL-DEBT.md`.
- **Docs change in the same commit as the code they describe.**

---

*Applies to `@lembaranz/core` and `@lembaranz/cli` 0.2.0.*

# Lembaranz — Agent Guidelines (v4.0.0)

> Tooling: GStack skills for planning/review + vendored ponytail skills for minimal-code discipline.
> Hermes agents: `lembaranz-dev` (coding), `lembaranz-mkt` (growth).

## 🏛️ Monorepo Layout

- `packages/core/src` — encryption engine, storage adapters, audit ledger (plain TypeScript)
- `packages/cli/src` — CLI + TUI (Ink + Commander.js)
- `packages/server/src` — local vault server (Bun.serve) that holds the master key for the web UI
- `packages/dashboard/src` — landing page + web client (Vite + React + Tailwind, i18n `en` / `zh`)

## 🌐 Language & Naming Policy (IMPORTANT)

- **English is the base language** for identifiers, comments, CLI output, documentation, and the landing page.
- **Simplified Chinese (`zh`) is the secondary language** for user-facing docs and UI. When you change user-facing copy, keep `en` and `zh` in sync (`packages/dashboard/src/locales/*.json`, README).
- Indonesian names survive **only where backward compatibility requires them**: legacy vault files (`saku.json`, `pelataran.json`) and their migration paths. Migrate on read; never delete those code paths without a data migration.
- New code, commits, and docs must be English-first. Do not introduce new Indonesian identifiers.

## 🤖 Agent Workflow

1. **Plan** — scope the change, name the files.
2. **Implement** — smallest diff that works (see Ponytail ladder below).
3. **Verify** — typecheck, tests, lint, and build the dashboard when UI changes.
4. **Document** — update the affected docs in the same change (README, SECURITY, PRIVACY, llms.txt, CHANGELOG).
5. **Ship** — commit/PR via the Changes panel; CI/CD workflows run on `main`.

### Verification Commands

```bash
bun install
bunx tsc --noEmit --project packages/core/tsconfig.json
bunx tsc --noEmit --project packages/cli/tsconfig.json
bunx tsc --noEmit --project packages/server/tsconfig.json
(cd packages/dashboard && bun run build)   # tsc + vite build
bun run lint
bun run lint:design   # UI anti-slop detector (impeccable)
bun run test:core
bun run security-audit
```

## 🎨 Design Anti-Slop Gate (impeccable)

> Upstream: [pbakaus/impeccable](https://github.com/pbakaus/impeccable) · docs: <https://impeccable.style> (MIT)

1. `bun run lint:design` runs `impeccable detect packages/dashboard/src` — the official detector for UI anti-patterns (gradient text, gray-on-color, side-tab cards, icon tiles, AI color palette). CI fails on findings.
2. Fix findings in source; do not add ignore rules unless a pattern is genuinely intentional (then document why next to the `impeccable ignores` entry).
3. UI copy follows the em-dash ban and the English base / Simplified Chinese policy (see Language & Naming).
4. Touch targets on interactive controls are ≥44px (Apple HIG).

## 🔒 Security Facts (keep docs in sync)

- **AES-GCM 256-bit**, random 12-byte IV per operation.
- **Argon2id** default KDF: `t=2`, `m=64 MiB`, `p=1`, 32-byte output, 16-byte random salts.
- **Legacy PBKDF2-HMAC-SHA-256** (100 000 iterations) fallback unlocks vaults/backups written by earlier releases and is automatically re-wrapped to Argon2id (`KDF_UPGRADED` audit entry).
- Each vault has a random **master key**; notes are encrypted with the master key, so KDF migrations never re-encrypt note data.
- **SHA-256** per-entry integrity seals + **tamper-evident hash-chained audit ledger** (`Audit.verifyChain()`, head hash for external anchoring).
- Vault files `0o600`, directories `0o700`; atomic writes; **panic key** wipes everything.
- Zero-knowledge: no network calls, no telemetry, no accounts.

## 🐴 Ponytail (minimal-code discipline)

> Vendored skills: `.claude/skills/ponytail*` (upstream: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT)

1. **Ladder** before writing code: YAGNI → reuse what exists → stdlib → native platform → installed dependency → one line → minimum code.
2. Never cut: trust-boundary validation, anti-data-loss error handling, security, accessibility.
3. Mark deliberate shortcuts with `ponytail: <ceiling>, <upgrade path>` — e.g. `// ponytail: O(n²) scan, index if data > 10k`.
4. `/ponytail-debt` harvests the markers into `PONYTAIL-DEBT.md`; keep that ledger current.

**Skills:** `/ponytail` (lite/full/ultra) · `/ponytail-debt` · `/ponytail-gain` · `/ponytail-review` · `/ponytail-audit` · `/ponytail-help`

## 🚀 Deployment

- **Web (landing + dashboard): Vercel.** Root `vercel.json` builds `packages/dashboard` (output `packages/dashboard/dist`, SPA rewrite, `install.sh` copied into `dist`). Connect the repo to the existing Vercel project (Settings → Git); production deploys follow pushes to `main`.
- **CLI:** npm publish `@lembaranz/*` — nothing is published yet, so README badges must not link to npm.

### Vault server

`lembaranz server` (`packages/server`) is the process that holds the master key
for the web UI. It binds loopback by default and requires a bearer token on
every route; `--host 0.0.0.0` is opt-in and warns. It has no framework and no
dependencies beyond `@lembaranz/core`.
- **Docker:** `compose.yaml` builds the CLI-only image (`Dockerfile`, TUI entrypoint).

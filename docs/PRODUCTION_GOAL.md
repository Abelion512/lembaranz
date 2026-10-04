# Production Goal Prompt — Lembaranz

> A copy-paste prompt for a long-horizon agent. Everything below the line is the
> prompt itself; everything above it explains where it came from.
>
> **Written:** 2026-10-03 · **Measured baseline:** 144 tests passing, 73.6% line
> coverage (core), impeccable clean, dashboard build green.

---

## Why this prompt exists

An inspection on 2026-10-03 found the project passes its own checks while
shipping things a funded company would not accept. The numbers below are
measured, not estimated.

| Area | Measured | Production bar |
|---|---|---|
| Core line coverage | **73.6%** | 90%+ on security-critical paths, 100% on crypto boundaries |
| `Context.ts` (vault path resolution) | **2.36% lines, 0% funcs** | 100%. It decides which file holds the key |
| `BrowserAdapter.ts` (web storage) | **9.38% lines** | 90%+. This is what the entire web product reads |
| `Sentinel.ts` (rate limiting) | **52.10% lines** | 95%+. It is the anti-brute-force control |
| `AuditLog.ts` (privacy report) | **6.90% lines** | 90% |
| Web/dashboard tests | **none, no test runner installed** | Unit + component + E2E + a11y |
| `Context` + `Backup`/`restore` paths | uncovered | must be tested before any launch |
| Structured logging / metrics | none | required to operate |
| CORS on the vault server | `Access-Control-Allow-Origin: *` | origin-scoped allowlist |
| Release integrity | `VERSION` hardcoded in `Landing.tsx`, not read from the manifest; `publish.yml`, `release.yml`, and `docker-publish.yml` all present | one version from one source, signed, reproducible |

Three failure modes from the audit are encoded as rules below, because each one
already happened in this repository:

1. **A screen that lied.** An "Env Manager" tab shipped with two buttons that
   only showed a success toast and one hardcoded row. On a product that asks for
   secrets, that is the most expensive class of bug there is.
2. **A passing test that proved nothing.** The whole suite went green while every
   server route returned 500, because the tests only asserted auth status codes
   and never read a response body. Suites also shared a process, so one suite
   silently half-initialised the module another depended on.
3. **Prose claims nothing verified.** The landing promised tamper evidence in
   marketing copy. It was true, but nothing in the product showed it.

The first and third were fixed during the October 2026 flow work, along with the
hardcoded version string that produced three different versions in one product.
The second is recorded below as a permanent rule because the same trap is one
reorganisation away from recurring.

---

# THE PROMPT

> Copy everything inside this block.

---

You are taking **Lembaranz** from a working prototype to a state defensible to
an investor and an external security auditor. This is a long-horizon task: expect
many sessions. Work phase by phase, and **do not start a phase until the previous
phase's gate passes.** A gate is a command that exits 0, not a judgement call.

## The product

Lembaranz is a **local-first, zero-knowledge vault for long-lived secrets**:
API keys, `.env` files, recovery codes, 2FA seeds, private keys. AES-GCM 256-bit
with Argon2id, a per-entry SHA-256 seal, and a hash-chained audit ledger.

It is **deliberately not a password manager**: no autofill, no sync, no accounts,
no team sharing. Do not add any of those. They are the losing direction. See
`docs/STRATEGY_2026.md`.

Monorepo, Bun workspaces:

```
packages/core       @lembaranz/core       crypto engine, storage adapters, ledger
packages/cli        @lembaranz/cli        Commander + Ink TUI
packages/server     @lembaranz/server     Bun.serve; holds the master key
packages/dashboard  Vite + React 19 + Tailwind, i18n en/zh, SPA with /app
```

## Non-negotiable rules

These are load-bearing. Violating any of them makes the work worthless.

1. **No control that does not do what it says.** If a button exists it works, and
   a test proves it. Delete any control that cannot.
2. **No claim the product cannot demonstrate.** Every security claim must be
   checkable by the user in the running product, not only in documentation.
3. **A test that cannot fail is not a test.** Every new test must be shown to
   fail when the behaviour is broken, then pass. Say so in the phase report.
4. **Never assert on prose.** Assert on `code`, on status, on bytes. Error
   messages are for humans and may be reworded freely; machine behaviour is not.
5. **One version, one source of truth.** Version is read from the package
   manifest, never hardcoded in a component.
6. **English is the base language** for code, comments, docs, and the product.
   Simplified Chinese mirrors it in `locales/zh.json`. Key sets must match
   exactly, verified by a test, not by eye.
7. **No em-dashes in UI copy.** Applies to components, locale strings, and
   `index.html` metadata.
8. **Every interactive control is at least 44x44px**, verified against rendered
   markup, not source.
9. **Never weaken an assertion, skip a test, or add a type/lint suppression to
   make something pass.** If a check is wrong, fix the check and say why.
10. **Preserve unrelated work.** Do not rewrite history or discard changes you
    did not make.

## Phase 0 — Make the ground honest

*Nothing else matters until the baseline can be trusted.*

- Install real coverage for the web package (Vitest + Testing Library) and add
  `test:dashboard` to the root `test` script.
- Set a coverage floor and make CI fail below it. Start the floor at the current
  number, never above what is true.
- Add a `verify` script that runs, in one command: lint, impeccable, typecheck
  for all four packages, the full test suite, the dashboard build, and the render
  harness. This is the single command every gate references.
- Add a test that asserts `en.json` and `zh.json` have identical key sets and
  identical array lengths.
- Add a test that asserts no interactive control in the rendered dashboard is
  under 44px.
- Inventory every command the README and PRD claim exists, and delete or correct
  the ones that do not. (The PRD lists `carve`, `env`, `plant`, `search`,
  `pick`; several are not in the CLI.)

**Gate:** `bun run verify` exits 0. The README claims match reality. Any mismatch
found is fixed in source, never by softening the inventory.

## Phase 1 — Test the security core

*Crypto you cannot test is crypto you cannot sell.*

Priority order, by blast radius:

1. `Context.ts`, currently 2.36% covered. Vault path resolution, including the
   `saku.json` / `pelataran.json` legacy migrations. Write the migration tests
   first; a migration that corrupts a vault is unrecoverable.
2. `BrowserAdapter.ts`, currently 9.38%. This is the storage layer for the whole
   web product. IndexedDB semantics, concurrent writes, quota and failure paths.
3. `Sentinel.ts`, currently 52.10%. Rate limiting is the anti-brute-force
   control. Test the boundary exactly, the window boundary, and bucket scoping.
4. Backup, restore, and password reset in `Archive.ts`.
5. `AuditLog.ts`, currently 6.90%.

Add property-based and fuzz tests for the crypto boundary: malformed ciphertext,
truncated IV segments, tampered seals, unicode and multi-byte input, very large
payloads. A vault must fail closed and say so, never return partial plaintext.

**Gate:** ≥90% line coverage on `core`, and 100% on `Context`, `BrowserAdapter`,
`Sentinel`. Every fuzz target runs in under 30s in CI.

## Phase 2 — Close the server trust boundary

- Replace `Access-Control-Allow-Origin: *` with an origin allowlist, configured,
  defaulting to loopback origins only.
- Add a per-IP request rate limit at the HTTP layer, separate from the existing
  unlock rate limit, which only protects the password path.
- Make the bearer token expire and rotate, or document precisely why a
  per-process token cannot be made safe on a shared network.
- Validate and bound every request body. Auth is correctly checked before
  `req.json()` today, so this is defence in depth rather than a live hole: cap the
  accepted body size so an authenticated client, or any future route added above
  the auth check, cannot make the process allocate without limit.
- Add a request id, structured JSON logging, and a `/health` that reports
  readiness without leaking vault state.
- Write an integration test per route that asserts the **response body**, not
  only the status code. This is how the last suite passed while every route was
  throwing.
- Run each test suite in its own process, permanently, with a comment explaining
  why.

**Gate:** every route has a test that asserts its body; CORS rejects a disallowed
origin; an oversized body is rejected before parsing; `bun run verify` exits 0.

## Phase 3 — Make the web product real

- Component tests for `LockScreen`, `IntegrityPanel`, and the entry editor,
  covering create, unlock, wrong password, locked mid-session, recover, and
  disconnect.
- End-to-end tests that drive a real browser through the full journey: start the
  server, connect with the printed link, create a vault, save an entry, lock,
  unlock, recover from the phrase, verify the chain.
- An automated accessibility check (axe) on every route, wired into CI.
- Test the clipboard wipe path, the idle timeout, and the lock-on-blur behaviour.
- Remove any remaining control that cannot be proven to work.

**Gate:** E2E suite green headlessly in CI. Axe reports zero violations. The
coverage floor for the dashboard is met.

## Phase 4 — Operability

A company cannot run what it cannot see.

- Structured logs with a request id, redacting anything that looks like a secret.
  **A log line must never contain plaintext vault data.**
- A `--verbose` flag and a `doctor` command that explains, in plain language,
  what is wrong with an install.
- Health and readiness endpoints with real semantics.
- Documented SLOs and an alert for each: server reachable, unlock error rate,
  recovery failure rate, chain verification failure.
- A runbook for the three failure modes that matter: a corrupted vault file, a
  forgotten password with a lost phrase, and a suspected key compromise.

**Gate:** a new operator can diagnose a broken install using only `doctor` and the
logs. Prove it by following the runbook on a deliberately broken install.

## Phase 5 — Supply chain and release

- Pin dependencies and commit the lockfile as the only install path.
- Generate an SBOM and attach it to every release.
- Sign release artefacts and verify the signature in CI.
- One version, read from the manifest, surfaced in the CLI, the dashboard, and
  `/health`.
- Restore the publish workflow, and make a dry-run publish part of every release
  check.
- Make `@lembaranz/server` properly publishable, or fold it into the CLI package
  and say so.
- Dependabot or Renovate enabled, with a documented triage SLA for security
  advisories.

**Gate:** a clean checkout can go from clone to signed, published, verified
artefact with one documented command. Every artefact carries an SBOM and a
signature.

## Phase 6 — Security review readiness

Produce the evidence pack an auditor asks for, before anyone asks.

- Independent third-party penetration test of the crypto design and the server
  trust boundary. Fix what it finds; do not argue the findings.
- Publish an explicit threat model covering: device seizure, coerced unlock,
  malicious browser extension, supply-chain compromise, and vault file theft.
- Document the residual risks honestly, including the ones you chose not to fix,
  and why.
- Run the open-source scanners already wired in CI and confirm each one is
  actually executing rather than silently passing.
- Verify file permissions (`0o600` files, `0o700` directories) hold under every
  supported install path, including Docker.

**Gate:** threat model and threat-model tests committed; pen-test findings
triaged with every critical and high closed or explicitly accepted in writing.

## Phase 7 — Performance, measured

No performance claim without a number and a machine.

- Establish a baseline for the paths that block a user: vault open, save an
  entry, list 1000 entries, and a full vault scan.
- Set budgets and enforce them in CI so a regression fails the build.
- Argon2id at `m=64 MiB` is a deliberate, expensive choice. Measure it on a real
  low-end machine and document the honest unlock latency, rather than quoting a
  figure from a developer laptop.
- Profile the dashboard: bundle budget, a code-split boundary that keeps the
  marketing page small, and a real Lighthouse run.

**Gate:** budgets enforced in CI. Every number quoted in the README is produced
by a script in the repository, so it cannot silently rot.

## Phase 8 — The product earns its claims

- Every number on the landing page comes from a cited source, with a test that
  fails if the copy drifts from the source.
- The comparison against Bitwarden, 1Password, and Proton Pass is re-checked each
  quarter, with a date on it, because those products change.
- The "what this is not" section stays. Losing the wrong visitor early is the
  strategy.
- Onboarding: a new user reaches their first saved secret in under two minutes,
  measured on a clean machine, with no manual token copying.

**Gate:** a timed clean-machine run of the full first-run journey, recorded as a
CI job, under the agreed budget.

## Definition of done

The work is finished when **all** of these are true, and each is demonstrable by
running a command:

1. `bun run verify` exits 0 and covers lint, design, types, tests, build.
2. Coverage floors are enforced in CI, not merely reported.
3. Every route has a test that asserts its response body.
4. The web product has unit, component, E2E, and accessibility tests.
5. No control in the product lacks a test proving it works.
6. Security review pack committed; no open critical or high findings.
7. A clean clone produces a signed, SBOM-bearing release by one command.
8. Every performance and market number in the docs is generated by a script.
9. A new user completes first save in under two minutes on a clean machine.
10. Nothing in the product claims anything it cannot demonstrate.

## Anti-goals

State these plainly so nobody "helpfully" violates them:

- **No browser autofill extension.** It makes you look like the product you
  displace. Build it last, as distribution, never as positioning.
- **No cloud sync, no accounts, no team sharing.** Data sovereignty and
  convenience point in opposite directions. This project picks sovereignty.
- **No telemetry.** Not "minimal". None.
- **No paid tier, no licensing change.** MIT stays.
- **No feature added to close a coverage gap.** Tests close gaps; features create
  them.

## Reporting

At the end of every phase, report in this shape and nothing else:

```
Phase N — <name>
Gate:      <command> → exit <code>
Changed:   <files, one line each>
Verified:  <what you observed, with the number>
Failed:    <anything not done, and exactly why>
Risks:     <what this phase made worse>
```

If a gate fails, say so and stop. Do not proceed to the next phase, and do not
reword the gate to make it pass.

---

*End of prompt.*
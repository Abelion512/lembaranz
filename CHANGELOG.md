# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Performance

Measured on this machine (`performance.now()`); numbers are from live probes, not estimates.

- **Landing page no longer downloads the vault.** `App.tsx` was statically imported by `main.tsx`, so every marketing visitor paid for Argon2id, the storage adapters, and `canvas-confetti`. The `/app` route is now `React.lazy` behind a `Suspense` fallback. Initial JS **355.87 kB → 282.27 kB** (gzip 114.16 → 91.09 kB, **-21%**); the 73.18 kB vault chunk loads only when a vault is actually opened. Argon2id now appears exclusively in the lazy chunk.
- **Vault state file writes ~18% faster and ~16% smaller.** `FileAdapter.save` serialised with `JSON.stringify(data, null, 2)`; the file is machine-owned state rewritten on every mutation, so indentation was pure overhead. Compact JSON measured `Storage.set` **1.01 ms → 0.83 ms** and shrank a 900-entry ledger **386 KiB → 324 KiB**. Attribution probe: the full-document rewrite was **89%** of audit-append cost (head lookup only 3%).
- **Audit append cost documented as quadratic.** Appends scan for the previous head each time and rewrite the whole document, so cost and file size grow with ledger length (measured 0.45 ms/append at 50 entries → 1.45 ms at 800). Left as-is deliberately: it is correct, atomic, and fine at personal-archive scale.

### Fixed

- **Audit ledger no longer forks under concurrent appends.** `Audit.log` is a read-modify-write over the whole ledger (read head -> `seq`/`prevHash` -> hash -> write). `Archive.restoreBackup` saves notes in chunks of 50 with `Promise.all`, so many appends overlapped, read the same head, and committed sibling entries sharing one `seq` + `prevHash`. A 60-note restore reproduced it: `verifyChain()` returned `ok: false` at position 3 with 49 entries at `seq=3` and 9 at `seq=5`, permanently marking a legitimately restored vault as tampered. Appends are now serialized through a queue; covered by `AuditConcurrency.test.ts`, which fails without the queue.
- **Global `Promise` no longer shadowed inside `Audit.ts`.** Declaring the queue as an object property annotated `Promise<unknown>` shadowed the global `Promise` for the entire module under Bun, so `Promise.all` and `new Promise(...)` were undefined for every importer (`Archive.ts` included), throwing `Vault locked` / `Promise is not a constructor` at runtime. The queue now lives in module scope as `appendQueueTail`.
- **Vault dashboard no longer renders unstyled panels.** `App.tsx` still referenced `.glass`, `.glass-strong`, `.glass-card`, and `.glass-enter`, which were removed from `index.css` in the Apple redesign, leaving the lock screen, sidebar, network graph, and four settings cards with no background or animation. All 8 usages (plus 2 stale `scanline` hooks) now map to the shipped tokens: `.surface`, `.surface-raised`, `.hairline`, and the existing `.fade-up` keyframes.
- **npm install on the repo now works**: replaced the Bun-only `workspace:*` protocol in `@lembaranz/dashboard` with `*` (npm resolves the monorepo package by name; Bun still links it from the workspace). Regenerated `bun.lock`.
- **`/install.sh` on the dashboard now serves the real installer**: added `packages/dashboard/public/install.sh` (kept in sync with the repo-root installer) so the preview and production static build expose the script; the previous HTML-fallback response broke `curl | bash`.
- **Installer now requires Bun explicitly**: npm cannot resolve unpublished workspace packages, so the npm fallback is removed with a clear error message and a one-line Bun install command.
- **CLI exits non-zero on fatal errors**: `unhandledRejection` / `uncaughtException` handlers in `packages/cli/src/main.ts` now call `process.exit(1)` instead of printing and hanging.
- **ESLint ignores nested clones** (`lembaranz/**`), which previously broke linting with `No tsconfigRootDir` parse errors whenever the installer was tested locally.

> Workspace packages are at **0.2.0** (`@lembaranz/core`, `@lembaranz/cli`); the
> `0.x` reset happened after the `1.0.x` entries further down, which predate it.

### Added
- **Tamper-evident audit ledger**: every audit entry now commits to the previous entry's hash (`Audit.verifyChain()`, `Audit.headHash()`), with `KDF_UPGRADED` events recorded and pre-ledger entries tolerated as legacy.
- **Landing page rebuilt for Vercel**: English base + Simplified Chinese (`en`/`zh`) with a language switcher, refreshed hero, security pipeline, FAQ, and accurate install instructions.
- **Language policy**: English is the base language for code, docs, CLI output, and UI; Simplified Chinese is the secondary language.

### Changed
- **Landing redesigned in the Apple design language** (black canvas, SF-style type stack, #0071e3 accent, hairline dividers, sentence-case copy), replacing the glassmorphism theme; `glass*` CSS utilities removed in favor of `surface`/`btn-primary`/`link` primitives.
- **Local vs Vercel web split**: the web dashboard is identical (`/app` everywhere), while the landing page resolves asset/CTA URLs relative to the origin (localhost when run locally, `lembaranz.vercel.app` on Vercel), and `install.sh` references come from a single `SITE_URL` constant.
- **Key derivation restored to Argon2id** (`t=2`, `m=64 MiB`, `p=1`) with an automatic PBKDF2-HMAC-SHA-256 fallback that unlocks vaults and portable backups written by earlier releases and re-wraps them with Argon2id (note ciphertext untouched).
- **Docker/compose**: image entrypoint fixed (`launch` instead of the non-existent `mulai` argument); `compose.yaml` now mounts the vault volume and runs the TUI interactively.
- **`install.sh`** installs from source with Bun or npm and no longer references the non-existent `lembaranzz` package.
- **Dependencies pruned**: unused Next.js-era packages removed from the workspace.

### Fixed
- Documentation synced with the implementation: SECURITY, PRIVACY, TERMS, README, `llms.txt`, quick reference, guides, and the CLI package README (which documented commands that never existed).
- README version badge no longer points at an unpublished npm package.
- **Legacy V2 vault migration** now re-derives an extractable key before re-wrapping, so vaults written by releases that used PBKDF2 migrate to V3 instead of silently failing to export the key.
- `scripts/security-audit.ts` output is English, matching the language policy.
- **React version mismatch** in the dashboard (`react` 19.2.8 vs `react-dom` 19.2.6) — both are now pinned to the exact same 19.2.8, as React 19 requires.

## [1.0.2] - 2026-05-11

### Fixed
- **File Persistence**: Fixed race condition and implemented atomic writes in `FileAdapter`.
- **Brand Unification**: Standardized the project name to "Lembaranz" across the CLI and documentation.
- **CLI Syntax**: Fixed syntax errors in `TerminalUI` due to merge conflicts.
- **Senses Integration**: Added `Senses` module and unit testing from Jules session.

## [1.0.1] - 2026-04-13

### Added
- **Landing Page Redesign**: Clean layout focused on installation, inspired by OpenCode.ai.
- **Multi-Page Routing**: Separate pages for `/`, `/why`, `/faq`, and `/docs`.
- **Multiple Installation Methods**: npm, bun, curl, docker, and git clone.
- **Dark Mode Toggle**: Support for light, dark, and system themes.
- **Control Orb**: Unified settings panel (Theme, Language, AI, MCP).
- **Branch #33**: All CI/CD workflows updated from `main` to `#33`.

### Changed
- **Mobile UX Optimization**: Collapsible installation commands on mobile devices.
- **Version Reset**: All packages reset to 1.0.x after scope migration.
- **README Simplification**: Clean, direct, no gimmicks.

### Fixed
- **Clone URL**: Fixed `YOUR_USERNAME` → `Abelion512/lembaranz`.
- **npm Ignore**: Internal folders excluded from publication.
- **Tailwind Classes**: Updated deprecated syntax.

---

## [1.0.0] - 2026-03-30

### Added
- **Scope Migration**: Full migration to `@lembaranz` organization.
- **Package Reset**: All packages reset to stable release `1.0.0`.
- **Textual Lockfile**: Transition to `bun.lock` (text) for better auditability.
- **AEO/GEO Optimization**: Advanced SEO metadata optimization with JSON-LD and regional rich context.
- **Unified CLI**: Full integration of `lembaranz` commands for monorepo ecosystem.

---

## [3.5.0] - 2026-04-13 *(Pre-Reset)*

> Versions 3.0.0–3.5.0 were published under the old package name `lembaranz` before scope migration to `@lembaranz`.

### Added
- **GitBook + Apple HIG Style**: Landing page redesign with AEO/GEO optimization.
- **Beginner-Friendly Section**: 4-step guide for new users.
- **JSON-LD Structured Data**: SoftwareApplication + FAQPage schema.

### Changed
- **GUI vs Web Clarification**: Desktop GUI (Tauri) vs Web Dashboard (Docker).
- **All Workflows**: Updated from `main` branch to `#33`.

---

## [3.4.0] - 2026-03-28

### Added
- **AI YOLO Mode**: One-push security system for Git (automatically disabled after 1 push).
- **Dependabot Configuration**: Automatic updates for npm + github-actions.
- **PRD Refactor**: Focused on CLI/TUI, 75% progress.

### Fixed
- **TypeScript**: ChildProcess typing in `Env.ts`.
- **Web Vault**: Marked as CLI-only (deprecated for web).

### Removed
- **Web Vault UI**: Web vault feature removed.

---

## [3.3.0] - 2026-02-22

### Added
- **Modern TUI Restoration**: Rebuilt interactive interface with Ink/React.
- **Loopless Scroll Logic**: Custom menu navigation without cursor wrapping.
- **Setup Sub-command**: `lembaranz setup` for .env management.

### Fixed
- **Emoji & Encoding**: Cleaned up corrupted characters in terminal UI.
- **Scrolling Trap**: Fixed viewport logic for full list scrolling.

---

## [3.2.0] - 2026-02-20

### Added
- **Vim Mode**: H/J/K/L navigation in editor.
- **Biometric Authentication**: WebAuthn simulation (Touch/FaceID).
- **Encrypted Vault (.lembaranz)**: Backup export with master key protection.
- **Fuzzy Search**: Smart CLI search for quick access.
- **Panic Button**: Emergency data deletion with passphrase.
- **Session Expiry**: Auto-lock after inactivity.

---

## [2.0.0–2.9.0] - 2026-02-17 to 2026-02-18

### Added
- **Dynamic Hero Section**: Rotating word titles.
- **Installation Script**: `install.sh` for automated setup.
- **Virtual List**: `react-window` for handling thousands of notes.
- **Smart Find Search**: Background indexing of encrypted content.
- **Public Documentation**: Basic guides accessible without opening vault.

# Lembaranz — Agent Guidelines (v3.5.0)

> Powered by GStack (Garry Tan's 23 specialist Claude Code skills)
> Hermes agents: `lembaranz-dev` (coding), `lembaranz-mkt` (growth)

## 🏛️ Struktur Monorepo
- `packages/core/src` — Logika inti, enkripsi, storage (Jiwa)
- `packages/cli/src` — CLI/TUI (Ink + Commander.js)
- `lembaranz-web/` — Landing page (Next.js 16)

## 🤖 Agent A — Development (lembaranz-dev)
**GStack workflow (wajib):**
1. `/office-hours` — Product interrogation sebelum coding
2. `/plan-ceo-review` — CEO scope check
3. `/plan-eng-review` — Architecture lock-in (ASCII diagrams)
4. `/autoplan` — Auto-generate implementation plan
5. **Implement** — Write code
6. `/review` — Staff engineer code review (auto-fix)
7. `/qa` — Browser QA (find & fix bugs)
8. `/ship` — Release: sync main, run tests, PR

**Aturan:**
- Load `gstack-autoplan`, `gstack-review`, `gstack-qa`, `gstack-ship` skills
- Build → lint → test before any ship
- Update AGENTS.md setelah setiap perubahan fungsional
- Gunakan konvensi nama Indonesia (Jiwa, Raga, Aksara, Brankas)

## 🤖 Agent B — Marketing & Growth (lembaranz-mkt)
**Workflow:**
1. `/landing-report` — Audit landing page conversion
2. SEO audit → fix technical SEO
3. Content strategy → blog posts, tutorials
4. Social hooks → Twitter/X, Reddit, HN, dev communities
5. Analytics setup → track traffic, conversion

**Aturan:**
- Target: developers Indonesia + global privacy community
- Content: bilingual (Indonesia + English)
- Hook in first 3 detik
- Track everything, A/B test before committing

## 🐴 Ponytail (minimal-code discipline)
> Vendored skills: `.claude/skills/ponytail*` (upstream: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT)

Aturan lazy-senior-dev untuk semua coding task (Agent A):
1. **Ladder** sebelum nulis kode: YAGNI → reuse yang ada → stdlib → native platform → dependency terpasang → satu baris → baru minimum code.
2. Jangan pernah potong: validasi trust-boundary, error handling anti data-loss, keamanan, accessibility.
3. Tandai shortcut sadar dengan komentar `ponytail: <ceiling>, <upgrade path>` — contoh: `// ponytail: O(n²) scan, index kalau data > 10k`.

**Skills:**
- `/ponytail` — lazy mode (`lite` / `full` / `ultra`)
- `/ponytail-debt` — harvest semua komentar `ponytail:` jadi ledger utang tech-debt (`PONYTAIL-DEBT.md`)
- `/ponytail-gain` — scoreboard dampak terukur (LOC/cost/time)
- `/ponytail-review` — review diff khusus over-engineering (`delete/stdlib/native/yagni/shrink`)
- `/ponytail-audit` — audit seluruh repo, ranking yang boleh dipotong
- `/ponytail-help` — kartu bantuan

## 🔒 Keamanan
- AES-GCM 256-bit (Brankas.ts)
- Argon2id key derivation
- SHA-256 integrity check
- Zero-knowledge: data stays on device

## 🔧 Build & Run
```bash
cd /media/abelion/Isaf/ican/project/Web/ACTIVE/lembaranz/lembaranz
bun install
bun run build

# CLI
bun run cli

# Landing page
cd ../lembaranz-web
bun run dev
```

## 🚀 Deployment
- Landing page: Vercel
- CLI: npm publish `@lembaranz/*`
- Docker: compose.yaml

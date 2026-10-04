# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

> Workspace packages are at **0.2.0** (`@lembaranz/core`, `@lembaranz/cli`); the
> `0.x` reset happened after the `1.0.x` entries further down, which predate it.

### Fixed

- **`lembaranz config set/get/show` never worked, and a subdirectory silently created a second vault.** `findProjectRoot` walked up from the search directory but called its own `check()` helper with `''` instead of the directory it had just resolved. `''` is falsy, so every check returned `null`, the caller reported "Project root not found" in every project, `detectContextAuto()` answered `personal` everywhere, and running from a subdirectory of a project fell back to the global vault rather than the project's. `Context.test.ts` fails 13 tests without the fix.
- **Restoring a backup produced an unreadable vault.** `restoreBackup` handed the still-ciphertext notes straight to `saveNote`, which encrypted them a second time, so every restored note read back as garbage. Restore now unseals each entry with the active key first and re-seals it on write; an entry it cannot unseal is counted as `skipped` rather than silently restored as ciphertext. It also refuses a backup whose `notes` field is not an array instead of reporting "restored 0, skipped 0". Found by writing the lifecycle tests before reading the code. `ArchiveLifecycle.test.ts` fails 2 tests without the fix.
- **A loosened privacy log was never retightened.** `appendFile`'s `mode` only applies when the file is created, so a log that had been made group-readable stayed that way for every later append. `AuditLog.ts` now `chmod`s the existing file back to `0o600` before writing.
- **`writeEnv` wrote a blank line into `.env` before every appended key.** The file was split on newlines and the trailing empty element `split` leaves for any file that ends in a newline was written out as a line of its own. The pre-existing test could not catch it, because its fixture had no trailing newline; `Context.test.ts` fails 2 tests without the fix.
- **The whole test suite passed while the server routes were throwing.** `bun test` runs every suite in one process, and the server suite imported `@lembaranz/core` after the core and CLI suites had already loaded it. The server then held a partially-initialised barrel: `Archive.isVaultSetup`, `Archive.getAllNotes`, `Archive.recoverVault`, and `Archive.getStats` were all `undefined`, so `/status`, `/notes`, `/recover`, and `/stats` answered 500. This was invisible because the existing server tests only asserted auth behaviour (that a missing token gives 401) and never checked a route body, so they passed against a server that could not serve a single request. `bun run test` now runs each suite in its own process. Verified: 144 pass, 0 fail (was 137 pass, 7 fail once route bodies were actually asserted).
- **`focus:outline-none` removed the focus ring from every text field**, including the master password field on the unlock screen, leaving only a 1px border-colour shift as the focus indicator. No control in the product opts out of the ring now, and `class-compile.test.ts` fails if one does.
- **Test files were being compiled into the production stylesheet.** The Tailwind `content` globs covered `src/**`, which includes `src/__tests__`. Tailwind scans text rather than meaning, so every utility named in a test file, including inside a comment, was emitted into the CSS visitors download. `__tests__` is now excluded, and the stylesheet dropped from 26.13 kB to 24.74 kB (5.86 kB gzipped) with no change to what any component renders.
- **Three contrast failures on the cream reading ground.** The redesign introduced `text-ink/45` and `text-ink/55` for the comparison table headers and footnote, which composite over `paper` to 2.93:1 and 3.96:1, both under WCAG AA for normal text, and `placeholder:text-faint/70`, which drops a placeholder to 3.29:1. The floor on the cream ground is `ink/60` at 4.65:1, and placeholders use `faint` undimmed. The focus ring had the same problem in a different form: the global ring is sand, which measures 1.66:1 against `paper`, so a keyboard user tabbing through the FAQ could not see where they were. The ring now flips to ink inside `.paper-field`, which measures 16.46:1. Every ratio is recorded next to the palette in `tailwind.config.js`.
- **Every button built on the shared `.btn` class measured 0px wide.** The class declared a 44px height floor but no width floor, and `inline-flex` is not a block-level box, so nothing could supply one. The touch-target suite caught it the moment the redesign introduced the class: five controls on the landing page and the Save button in the editor all reported `width 0px < 44px`.
- **The web vault had no working way to recover a forgotten password.** `POST /recover` and the BIP39 generator had been in the codebase all along, but the lock screen only offered a master password field, so a user who forgot it had no path in and the web product was permanently unusable. The lock screen now has a recovery flow that posts the phrase and reports what went wrong, and `bun run verify:render` asserts it renders.
- **A wrong master password reported `The operation failed for an operation-specific reason`.** `unlockVault` knew the branch was a wrong password (it audits `"Wrong Password"`) but returned the raw WebCrypto failure verbatim, so the most common event in the product produced a meaningless message in every client. It now returns `WRONG_PASSWORD`, a fixed exported constant.
- **Locking the vault left the UI silently empty with no way back in.** The workspace read notes with `if (res.data) setNotes(...)` and discarded errors, so `Vault locked` produced a stale or empty list, and the only field that accepts a master password lived on the screen the user had just left. Vault reads now go through one `run` helper that treats a `locked` result as a session event and returns the user to the lock screen.
- **`LEMBARANZ_PORT` and `LEMBARANZ_HOST` were silently ignored by `lembaranz server`.** The Commander defaults were applied unconditionally, overwriting the environment. Verified: `LEMBARANZ_PORT=5199 lembaranz server` bound 5121 before and 5199 after.
- **`POST /setup` reported success on an existing vault.** It minted a new master key and orphaned every note encrypted under the old one while telling the UI it had created a new vault. It now refuses with `already_setup`.
- **`Audit.verifyChain()` was not awaited in the new `/audit` route**, so the chain serialised as `{}` and the integrity view rendered "undefined". Caught by the route test, not by inspection.
- **A 500 from the server was invisible.** The route error boundary caught, replied, and discarded. Unexpected failures in a process that holds a master key are real faults, so they are logged now.

### Changed

- **The copy was still talking too much, so it got cut again, harder.** Every landing string was rewritten a second time: no English string is now longer than 20 words, most are two short sentences, and several dropped from 30+ words to under 10 (the hero subtitle, the four honest-limits items, all four security pipeline notes, every FAQ answer). The landing catalogue went from roughly 2,500 tokens to 1,144, with `zh` rewritten in step. Nothing asserted was relaxed: the anchors `verify-render.tsx` checks still read the same.
- **The install method tabs were the card inside the card, not the command block.** Flattening the block was the wrong fix: the filled `bg-sand/15` pill on the active option is what read as a nested card, because a filled rectangle inside a bordered block is a card by any reasonable definition. The active state is now a 2px sand underline plus sand text (`aria-pressed` carries the state for assistive tech), the inactive ones a transparent border, which is the tab treatment opencode.ai uses instead of letting each command be its own copyable row. The 44px tap floors are unchanged.
- **The footer is one centred cluster.** With the brand block and the duplicate nav gone, a left/right split stranded the copyright at one edge and left the other empty, so the row is centred with even gaps and `py-14` became `py-12`.
- **Every string that ran past its job was rewritten.** 42 English strings across the hero, problem, holds, comparison, honest-limits, security, install, roadmap, FAQ and CTA sections, plus the three longest strings on the vault screens, mostly 30% to 60% shorter, with Simplified Chinese rewritten in step. Concretely: the problem title is `Logins got solved. Secrets did not.`, the comparison lede drops the taste contest, all four honest-limits items and all four security pipeline notes lost their second sentence, the FAQ answers lost their restatements, and the hero subtitle is now two sentences. The anchors `verify-render.tsx` asserts on are still present, so the narrative checks did not have to be relaxed.
- **The landing page repeated one claim in four places and trimmed the rest.** The hero chip (`v0.2.0 · Open source · MIT · No account, no cloud`), the closing CTA eyebrow, and the footer motto all restated what the hero's own metric strip already measures (`0` accounts, telemetry, and outbound requests), and the footer's wordmark, tagline, and a second copy of the section nav repeated the header. All six are gone. The headline was dropped a step (`4.25rem` to `3.5rem` at `lg`), and the hero lede, the problem close, the comparison footnote, the honest-limits close, and the install step 2 were cut to roughly half their length in `en` and `zh` together. `src/version.ts` went with the chip that was its only consumer.
- **The install command was a card inside a card.** A bordered, rounded box wrapped a tinted `bg-ink-soft` panel, so the block read as two surfaces where the page's other rows are single surfaces divided by hairlines. The method tabs and the command are now two rows of one block separated by a `border-t`, with the tinted panel and the rounding removed.
- **The contrast suite's anti-vacuity floors were re-based after that trim.** `contrast.test.tsx` asserts how much text it measured as well as what failed, so removing eleven runs of text took the landing page from 180 measured runs to 169 and the total from 208 to 197, below the old floors. The floors now sit about 10% under the trimmed page; what they protect is "this walked a real page", not "this page has 201 runs", and every defect that check was written to catch still trips it.
- **Three footer links were rendering browser blue on the charcoal footer at 1.97:1.** The GitHub, Privacy Policy and Security Policy anchors had no colour of their own and relied on inheriting `text-faint` from their parent. An unstyled anchor does not inherit: the user agent's `:link { color: #0000ee }` wins over an inherited value. Each now sets `text-faint` directly.
- **Contrast is now measured rather than assumed.** `contrast.test.tsx` renders every screen against the compiled stylesheet and asserts each run of text clears WCAG AA on its own composited background, resolving `text-ink/60`, the translucent `.glass` cards and the gradient section grounds to the pixels a browser would actually paint. It caught three defects in itself while being written: an `opacity` read that marked the whole page invisible, a colour parser that rejected every `var(--tw-text-opacity)` value, and a compositing order that let the outermost ground win. Between them those cut 202 measured runs down to 44 while still reporting everything clear, which is why the suite now asserts how much it measured and not only what it failed.
- **The shape audit covers every screen, not the landing page alone.** `scripts/verify-render.tsx` renders the landing, lock, connect, integrity and app shell and asserts on each that no label sits directly above a heading, and that it rendered enough markup for the rule to mean anything.
- **Labels are sentence case, and no label sits on its own above a heading.** The tracked uppercase eyebrow, the uppercase chip, the uppercase nav, the uppercase table head, and the uppercase tab strip read as generated copy, and a rendered scan of the built page counted them as such. The small tracked look is kept, because it is the label role and not the casing that was the problem: `.eyebrow` and `.chip` are now sentence case at a much lighter tracking, and each section label is a block span *inside* its `<h2>` rather than a paragraph above it. A screen reader now announces a section as one title instead of a label and then a title.
- **`bun run lint:design` was blind to both of those, so the checks moved to where they can see.** `impeccable detect` reads source text and cannot resolve a computed style, which is why it reported zero while a browser reported 25. `class-compile.test.ts` now reads the compiled stylesheet and fails on any rule that reaches the page with `text-transform: uppercase`, catching the utility whether a component names it or a shared class `@apply`s it. `scripts/verify-render.tsx` walks the rendered markup with a real depth stack and fails on any label whose next sibling is a heading. Both were confirmed to fail when the pattern was reintroduced.
- **The security pipeline subheading is a real subheading.** "What happens when you save an entry" was a full sentence rendered through the 11px uppercase label class used for two-word labels.
- **The landing page and the web dashboard were redesigned as one product.** The old build was a blue-on-black Apple-styled page with a sans display face, and the vault screens were a colder interface again. Both now sit in one system: a warm charcoal ground, a cream reading ground, and a single sand accent that every interactive control borrows, with a system serif for display type. The landing alternates grounds per section so a long read is not one unbroken dark scroll, and the hero follows the pattern the redesign was modelled on: an eyebrow chip, a serif headline with one word in the accent, a short rule under it, a solid and a ghost call to action side by side, a translucent tag card, and a translucent three-metric stat strip along the foot of the field. The vault, lock, connect, and integrity screens were restyled onto the same tokens, so opening a vault reads as walking through the door rather than switching products. No component contains a literal hex colour, and there is no second accent hue anywhere in the product.
- **Display type is drawn from fonts already on the machine.** A product whose FAQ says it makes no network requests cannot also pull a serif off a font CDN, so `tailwind.config.js` ships a system stack that leads with the best face on each OS and falls back to Georgia.
- **Repositioned: a local vault for long-lived secrets, not a password manager.** The old landing led with "a vault for your words" and a rotating list of adjectives, which competed with password managers without naming anything they cannot do. That is a losing comparison, because ~5 billion passkeys are now active and the login-storage job is being absorbed by Apple and Google. The new narrative is the asymmetry: passwords are becoming passkeys, secrets are not, with ~29 million secrets leaked on public GitHub in a year and 64% of 2022 leaks still valid. Full reasoning, the architectural comparison against Bitwarden, 1Password and Proton Pass, and the upward expansion path are in `docs/STRATEGY_2026.md`.
- **The landing page now states what the product cannot do.** A section lists the four real limits, including no browser autofill, and names 1Password and Bitwarden as the better tool for anyone whose problem is logging in. Turning away the wrong visitor now is cheaper than disappointing them in week two, and it is what makes the rest of the page credible.
- **Removed the "Env Manager" tab.** It had two buttons that only showed a success toast without saving anything, and a "Saved Env Profiles" list containing one hardcoded `lembaranz-core` row. On a product whose pitch is "trust us with your secrets", a screen that lies about having stored them was the most expensive possible trust bug. It is replaced by an integrity view that verifies the SHA-256 seal and hash-chained ledger live from `POST /audit`, which is checkable rather than asserted.
- **Connecting no longer requires selecting a 36-character token from terminal output.** `lembaranz server` prints a link carrying the origin and token in the URL fragment, and `--open` launches it. The fragment is never sent to a server or placed in a `Referer` header, and the dashboard strips it with `replaceState` on first render so it does not persist in session history. The manual connect form is retained as the documented fallback.
- **The recovery phrase is generated and confirmed instead of typed in blind.** Setup took it as optional free text with no validation, so a vault could be created whose only way back in was a typo nobody would discover until it was needed. It is now generated by the server (keeping the BIP39 wordlist out of the marketing bundle), shown as a numbered grid, checksum-validated, and gated behind an explicit "I have written this down" confirmation that setup will not complete without.
- **Server errors carry a machine-readable `code`.** The UI decided what to do next by matching on English prose, so rewording a message broke a flow. It now branches on `code` (`wrong_password`, `locked`, `rate_limited`, `recovery_failed`, `already_setup`, `unreachable`).
- **All dashboard copy moved into `locales/*.json`.** Strings were previously hardcoded inline and mixed English with Chinese on the same line ("Incorrect Master Password / 无效密码"), which bypassed the i18n system and the language policy in `AGENTS.md`. `en` and `zh` are verified key-for-key in sync at 151 keys each.
- **`LEMBARANZ V3` was hardcoded in four places** while the landing page showed `v0.2.0`, so one product displayed three versions. The version is now a single constant on the landing page.
- **Minimum master password raised from 8 to 12 characters** in both the CLI wizard and the web setup, which previously agreed at 8. The rule applies at setup only, so existing vaults are unaffected.

### Added

- **`class-compile.test.ts`, which asserts every utility the source names became a rule.** Tailwind fails silently: a misspelled variant, an unknown colour, or an opacity modifier that is not on the default scale produces no CSS at all, the element still renders, every other test still passes, and the page is quietly wrong. The suite caught two of these during the redesign. `border-ink/12` and `divide-ink/12` compiled to nothing because `12` is not on Tailwind's default opacity scale, so every hairline on the cream sections was falling back to the preflight default `#e5e7eb`, a cold grey on a warm ground. The suite fails when either class is put back.
- **The security core is now tested against its own boundaries rather than its happy path.** Six new suites cover `Context` (path resolution and the `saku.json`/`pelataran.json` migrations, written first because vault data is unrecoverable if a migration is wrong), `BrowserAdapter` (IndexedDB keyPath semantics, concurrency, and quota failures, on `fake-indexeddb`), `Sentinel` (every rate-limit and lockout boundary pinned to the constant that defines it), `Archive` backup/restore/reset, `AuditLog`, and a seeded crypto fuzz suite that flips bits, truncates, extends, and forges stored entries. Every new test was shown to fail with the behaviour broken before it was shown to pass. `Context.ts`, `BrowserAdapter.ts`, and `Sentinel.ts` are at 100% line coverage.
- **`POST /recovery-phrase`** generates a BIP39 phrase without persisting anything, so the dashboard can offer a real recovery path while keeping the wordlist out of the initial bundle.
- **`POST /audit` and `POST /stats`** expose the hash-chain verification and entry counts the integrity view renders.
- **`lembaranz server --open`, `--port`, `--web`** and the `LEMBARANZ_WEB_URL` env var for pointing the connect link at a deployed dashboard.
- **`bun run verify:render`** server-renders the landing and lock screens and asserts the positioning copy and the recovery path reach the DOM, which is verifiable without a browser. The harness lives at `packages/dashboard/scripts/verify-render.tsx` because `react-dom` is a dependency of that package only; from the repo root Bun cannot resolve `react-dom/server`. It sits outside `src/`, so it is never bundled and never typechecked as app code.

### Security

- **BIP39 wordlist restored to the full 2048 words; roughly 1 vault in 12 had an unusable recovery phrase.** The list in `Password.ts` held 2034 entries, including four words that are not in BIP39 at all (`blow`, `bunny`, `tried`, `well`), which shifted every subsequent index onto the wrong word. `WORDLIST_SIZE` was hardcoded to `2048`, so indices 2034-2047 indexed past the end of the array and emitted the literal string `undefined` into a generated phrase. Measured **4.4%** of generated phrases contained an invalid word, rising to **~7.9%** at the default 12 words, so a user who followed the setup wizard carefully could still end up with a phrase that could never be used. The list is now verified byte-for-byte against the BIP39 spec, `WORDLIST_SIZE` is derived from the array so modulo addressing can never run past its end, and a load-time assertion rejects any list that is not exactly 2048 words. The list is also packed as a single string, which removes the 2000-line block that a stray edit could reorder.
- **Recovery phrase is now rate limited and every failed attempt is audited.** `unlockVault` logged a `SECURITY_ALERT` on each wrong password and the CLI gated it with `Sentinel`, but `recoverVault` did neither, and both the CLI wizard and the TUI unlock screen called it directly. The highest-value secret in the vault was the only unlock path with no throttle and no evidence trail. `recoverVault` now checks a `vault-recovery` bucket, logs `SECURITY_ALERT` on failure, resets on success, and returns an actionable message instead of leaking WebCrypto's `The operation failed for an operation-specific reason`.
- **Decrypted plaintext no longer accumulates without bound in memory.** `Vault.encryptPacked`/`decryptPacked` cached every decrypted note title, preview, body, and credential string in a module-level map that only cleared on unlock or lock, so a long session held the whole vault in plain memory and a heap dump exposed it. The cache is capped at 4096 entries with oldest-first eviction. The cap deliberately exceeds one full vault scan: a 256-entry cap against 300 notes forced a near-total miss rate and pushed `getAllNotes` from 3.5 ms to 16.5 ms, so sizing it above a full read is the actual constraint. Repeat-read speed is unchanged (measured 3.5 ms -> 0.26 ms warm on 300 notes) and `clearKey()` still wipes it.
- **Injected note titles are no longer rendered as if they were genuine.** `decryptPacked` returns any string without a `|` separator unchanged, for entries written before encryption existed. That made a stored title indistinguishable from a decrypted one, so anything able to write the store could replace a title with arbitrary plaintext and have it displayed with no warning. `getAllNotes` was the worse case: it never runs the per-entry seal (that seal covers the content this path does not decrypt), so the injected text reached the screen with no indicator at all. `Vault.isPacked` now distinguishes a real ciphertext from injected plaintext, and both `getAllNotes` and `decryptNote` render `⚠️ [UNSEALED]` and write a `SECURITY_ALERT` instead. Entries written by `saveNote` are always packed, so the check never fires on legitimate data. Verified: a tampered title rendered as `INJECTED BY ATTACKER` before, `⚠️ [UNSEALED]` after.
- **The server no longer exposes an unthrottled password oracle.** Adding `lembaranz server` introduced a regression: password throttling lived only in the CLI's `openVaultCLI`, so the server calling `Archive.unlockVault` directly answered every guess. Measured against the running server: 12 wrong passwords, 12 Argon2id derivations, no lockout, and the correct password never even checked. The limit moved into `unlockVault` itself, the one place every caller passes through, and the CLI's duplicate check was removed so attempts are no longer double-counted. Refusals are audited and the lockout now holds even against the correct password.
- **Rate-limit buckets are scoped per vault.** The unlock bucket used the constant key `vault-unlock` for every vault, so a lockout on `personal` also blocked `project`, and any process opening two vaults shared one counter. Buckets are now keyed on the open vault path.
- **The server survives a failing route.** The route switch had no error boundary, so a throw inside any vault call took down the process and, with it, the unlocked vault held in memory. Routes are now wrapped so a bad request returns a 500 and the server stays up.
- **The server compares its bearer token in constant time.** The check used `!==`, which exits on the first differing character. It uses `Sentinel.constantTimeCompare`, which already existed in core.
- **Corrupt or tampered hex no longer decodes to different bytes.** `Vault.hexToBytes` used a branch-free nibble identity that is only valid on `[0-9a-f]`; other characters collide onto valid nibbles (`z` → 3, `G` → 10, `-` → 13), so a corrupted or altered IV segment in a stored `ivHex|base64` string decoded to the wrong 12 bytes instead of failing. Non-hex input is now rejected.
- **The master key no longer lives in the browser.** The dashboard previously decrypted and held the vault key in the page, so any XSS, malicious extension, or compromised dependency could read every note straight out of IndexedDB. Key custody moved to `lembaranz server`; the browser holds a bearer token for one loopback process. The vault route's client bundle also shrank from 76.98 kB to 40.93 kB (-47%) as a side effect, because it no longer ships the crypto engine.
- **Release runs from exactly one workflow.** `npm-publish.yml` and `release.yml` both triggered on `push: main` and both published through changesets. Their `concurrency` keys were derived from the workflow *name* (`Professional NPM Publish (Big Co Style)` vs `rilis`), so they did not exclude each other and a push could start two publishes at once. The duplicate is deleted and the survivor is now English throughout.

### Added

- **Real BIP39 mnemonics.** `generateMnemonic` now produces standard mnemonics at the BIP39 lengths (12/15/18/21/24): random entropy plus the leading `ENT/32` bits of its SHA-256 as a checksum. A 12-word phrase is 128 bits of entropy with a 4-bit typo check and is interoperable with any BIP39 wallet, where before it was uniform random words with no checksum. `validateMnemonicChecksum` verifies that checksum. `validateMnemonic` still only checks word membership on purpose: phrases issued before the checksum existed remain valid recovery material, so the word-list check must keep accepting them or those users lose their vault. Use the checksum to warn, never to block recovery.
- **A corrected note on BIP39 typo detection.** Four checksum bits over 12 words means roughly **1 in 16 single-word typos still validate**. Local checksum warnings are therefore advisory, not proof; the recovery UI must not promise that a phrase which passes the check is correct.
- **Both recovery entry points now surface the checksum advisory.** `validateMnemonicChecksum` existed but nothing called it, so a mistyped phrase still cost a full Argon2id derivation and a rate-limited attempt. The TUI unlock screen and the `setup` wizard now warn before recovering. The warning never blocks: phrases written down by releases that predate the checksum must keep working, so recovery is still attempted and the failure message stays the actionable one.
- **Tamper-evident audit ledger**: every audit entry now commits to the previous entry's hash (`Audit.verifyChain()`, `Audit.headHash()`), with `KDF_UPGRADED` events recorded and pre-ledger entries tolerated as legacy.
- **Landing page rebuilt for Vercel**: English base + Simplified Chinese (`en`/`zh`) with a language switcher, refreshed hero, security pipeline, FAQ, and accurate install instructions.
- **Language policy**: English is the base language for code, docs, CLI output, and UI; Simplified Chinese is the secondary language.
- **`docs/REPOSITORY_MAP.md`: every file and folder indexed.** A full audit found 51 of 71 source files carried no header comment and no file listed the repository's actual shape, so a new contributor had no way to know what existed. The map covers every top-level file, all three packages down to each source file with its role and approximate size, `docs/`, `.github/`, and `scripts/`, plus the conventions a change is expected to follow. It records the `.github/workflows/` problems found in the audit so the next person does not rediscover them, and it is linked from `README.md` and `llms.txt` so it stays discoverable.
- **`lembaranz server`**: the vault is now served over HTTP from a local process. Run it, paste the address and token it prints into the web UI, and the two are connected. The master key stays in the server process, so a browser tab no longer holds it.
- **`@lembaranz/server`**: `Bun.serve` with no framework and no new dependency. Loopback-only by default with an opt-in `--host` that warns; one bearer token per process guards every route; `Cache-Control: no-store` on all responses. Routes mirror the vault operations the web UI calls and nothing else.
- **Web UI client (`api.ts`)** mirrors the `Archive` result shape, so `Archive.x(...)` became `api.x(...)` at nine call sites with no component restructuring. The token is kept in `sessionStorage`, so closing the tab ends the session.
- **`ConnectScreen`** collects the server address and token before the vault UI renders. Without a reachable server there is nothing to talk to, so this gates the app rather than failing on every call.
- **Server and unlock rate-limit tests.** 11 tests cover the auth boundary (missing, wrong, empty and prefix tokens all rejected; correct token accepted), `Cache-Control: no-store`, 404 and malformed-body handling, loopback binding, and that HTTP password guessing actually locks out. The throttling case fails against the code as it was before the fix. The bucket mechanics themselves are covered in core next to the code that owns them.
- **Release automation consolidated onto one workflow.** Changesets was already configured but two workflows both published, and no changeset files were ever added, so versions never moved on their own. `npm-publish.yml` is deleted; `release.yml` is the single publisher and is English throughout (it was still named `rilis`, with Indonesian step names and a `chore: rilis versi baru` commit message, against the language policy).

### Fixed

- **Copied secrets are wiped from the system clipboard.** `App.tsx` carried a comment claiming it triggered an "auto-wipe simulation" and then only reset an icon. Copying a credential left it on the clipboard indefinitely. It is now cleared after 30s, and only when the clipboard still holds exactly the value we wrote, so a later copy by the user is never destroyed.
- **Setup no longer recommends photographing the recovery phrase.** When a user declined to confirm they had written it down, the CLI advised them to screenshot the words and delete the screenshot, which is exactly what `docs/RECOVERY_PHRASE.md` forbids. Now it points at paper and states that anyone holding the words keeps access.
- **Tab bar is a real tablist.** The four section tabs are `role="tab"` with `aria-selected`, `aria-controls` and matching `tabpanel` roles, so screen readers announce the selection instead of four loose buttons. Note rows were a `<div onClick>` with no keyboard path and are now focusable buttons.
- **Touch targets meet the 44px minimum** on the tab bar, the note actions, and the lock/copy/delete icon buttons, which were 24-32px.
- **Indonesian removed from shipped UI and CLI output.** The dashboard section tab read `LARAS` with a "Laras (Environment Manager)" heading, the settings tab read `CONF`, and the setup wizard printed `PENTING: Tulis 12 kata ini di KERTAS!`. Now `ENV`, `SETTINGS`, and English copy, matching the English-base language policy.
- **CI runs the CLI tests.** `ci.yml` ran `test:core` only, so the three CLI test files were gated by nothing. It now runs `bun run test`.
- **Data loss: concurrent writes on a cold `FileAdapter` persisted one key out of many.** `load()` checked `this.data` and then awaited `readFile`, so every concurrent first-touch passed the check and each built its own document object; whichever resolved last replaced the others and the rest were silently discarded. Measured on a fresh vault: 5 concurrent sets persisted 1 key, 50 persisted 1, 200 persisted 1. A warm adapter was unaffected, which is why the existing `FileAdapter.test.ts` did not catch it. The save queue was never at fault; the discarded documents were. `load()` now shares one in-flight read. `Archive.restoreBackup` drives `saveNote` through `Promise.all` in chunks of 50 and is the realistic trigger, since it is the one caller that fans out against a store that may not be warm yet. Regression test in `StorageIntegrity.test.ts` fails 5/9 without the fix.
- **`Storage.getAdapter` could construct more than one adapter.** The Node branch awaits a dynamic import, so concurrent first-touches each passed the `if (adapter)` check and built their own adapter. Two `FileAdapter` instances hold separate in-memory copies of the document, so writes through one are invisible to reads through the other. The in-flight construction is now shared, and the promise is cleared on rejection so a transient failure does not poison the store for the session.
- **Orphaned duplicate dashboard tree removed.** `packages/dashboard/packages/dashboard/src/` held a second, stale copy of `i18n.ts` and both locale files (582 and 590 bytes against the real 9031 and 9005), referenced by no config and no import. It was a build-time trap: editing the wrong copy would have silently changed nothing.
- Regression tests cover the wordlist length, absence of out-of-range words, the canonical BIP39 vectors, checksum typo detection, and the back-compatibility of the word-list validator. The typo test is deliberately statistical rather than a hard assertion, because of the 1-in-16 property above.
- **Audit ledger no longer forks under concurrent appends.** `Audit.log` is a read-modify-write over the whole ledger (read head -> `seq`/`prevHash` -> hash -> write). `Archive.restoreBackup` saves notes in chunks of 50 with `Promise.all`, so many appends overlapped, read the same head, and committed sibling entries sharing one `seq` + `prevHash`. A 60-note restore reproduced it: `verifyChain()` returned `ok: false` at position 3 with 49 entries at `seq=3` and 9 at `seq=5`, permanently marking a legitimately restored vault as tampered. Appends are now serialized through a queue; covered by `AuditConcurrency.test.ts`, which fails without the queue.
- **Global `Promise` no longer shadowed inside `Audit.ts`.** Declaring the queue as an object property annotated `Promise<unknown>` shadowed the global `Promise` for the entire module under Bun, so `Promise.all` and `new Promise(...)` were undefined for every importer (`Archive.ts` included), throwing `Vault locked` / `Promise is not a constructor` at runtime. The queue now lives in module scope as `appendQueueTail`.
- **`docs/RECOVERY_PHRASE.md` no longer documents an API that does not exist.** It claimed the generator used rejection sampling (it does not, and 2048 = 2^11 divides 2^32 exactly, so there is no modulo bias to mitigate), quoted a `generateMnemonic` body that never existed, and listed BIP39 checksums as a future improvement that had since shipped. It also carried an Indonesian title and a "Version 3.5.0" footer against 0.2.0 packages. Corrected against the real `Archive.setupVault` / `Archive.recoverVault` / `Password.ts`, with the 128-bit entropy math stated correctly (132 bits encoded, 4 of them checksum) and the 1-in-16 typo property documented where users will hit it.
- **Vault dashboard no longer renders unstyled panels.** `App.tsx` still referenced `.glass`, `.glass-strong`, `.glass-card`, and `.glass-enter`, which were removed from `index.css` in the Apple redesign, leaving the lock screen, sidebar, network graph, and four settings cards with no background or animation. All 8 usages (plus 2 stale `scanline` hooks) now map to the shipped tokens: `.surface`, `.surface-raised`, `.hairline`, and the existing `.fade-up` keyframes.
- **npm install on the repo now works**: replaced the Bun-only `workspace:*` protocol in `@lembaranz/dashboard` with `*` (npm resolves the monorepo package by name; Bun still links it from the workspace). Regenerated `bun.lock`.
- **`/install.sh` on the dashboard now serves the real installer**: added `packages/dashboard/public/install.sh` (kept in sync with the repo-root installer) so the preview and production static build expose the script; the previous HTML-fallback response broke `curl | bash`.
- **Installer now requires Bun explicitly**: npm cannot resolve unpublished workspace packages, so the npm fallback is removed with a clear error message and a one-line Bun install command.
- **Legacy V2 vault migration** now re-derives an extractable key before re-wrapping, so vaults written by releases that used PBKDF2 migrate to V3 instead of silently failing to export the key.
- **React version mismatch** in the dashboard (`react` 19.2.8 vs `react-dom` 19.2.6), both now pinned to the exact same 19.2.8, as React 19 requires.
- **CLI exits non-zero on fatal errors**: `unhandledRejection` / `uncaughtException` handlers in `packages/cli/src/main.ts` now call `process.exit(1)` instead of printing and hanging.
- **ESLint ignores nested clones** (`lembaranz/**`), which previously broke linting with `No tsconfigRootDir` parse errors whenever the installer was tested locally.
- `PONYTAIL-DEBT.md` line references were stale (`Audit.ts:81` -> 54, `main.tsx:27` -> 30) and the ledger was missing the markers added with this change. Regenerated to 4 entries.
- `scripts/security-audit.ts` output is English, matching the language policy.
- Documentation synced with the implementation: SECURITY, PRIVACY, TERMS, README, `llms.txt`, quick reference, guides, and the CLI package README (which documented commands that never existed).
- README version badge no longer points at an unpublished npm package.

### Performance

Measured on this machine (`performance.now()`); numbers are from live probes, not estimates.

- **Landing page no longer downloads the vault.** `App.tsx` was statically imported by `main.tsx`, so every marketing visitor paid for Argon2id, the storage adapters, and `canvas-confetti`. The `/app` route is now `React.lazy` behind a `Suspense` fallback. Initial JS **355.87 kB → 282.27 kB** (gzip 114.16 → 91.09 kB, **-21%**); the 73.18 kB vault chunk loads only when a vault is actually opened. Argon2id now appears exclusively in the lazy chunk.
- **Vault state file writes ~18% faster and ~16% smaller.** `FileAdapter.save` serialised with `JSON.stringify(data, null, 2)`; the file is machine-owned state rewritten on every mutation, so indentation was pure overhead. Compact JSON measured `Storage.set` **1.01 ms → 0.83 ms** and shrank a 900-entry ledger **386 KiB → 324 KiB**. Attribution probe: the full-document rewrite was **89%** of audit-append cost (head lookup only 3%).
- **Audit append cost documented as quadratic.** Appends scan for the previous head each time and rewrite the whole document, so cost and file size grow with ledger length (measured 0.45 ms/append at 50 entries → 1.45 ms at 800). Left as-is deliberately: it is correct, atomic, and fine at personal-archive scale.
- **Audit head lookup re-measured and confirmed not worth optimizing.** `Audit.append` resolves the chain head through `listEntries()`, which reads and sorts the whole ledger on every append. Measured at 0.09 ms against a ~3 ms append at 2000 entries (about 3%), matching the earlier attribution probe.
- **Note-save write cost measured and deliberately left alone.** `saveNote` performs two `Storage.set` calls (the note and its audit append), each rewriting the entire vault document: ~2.0 ms of the ~2.8 ms operation on a 435 KB document, growing linearly with vault size. Coalescing both sets into one write by scheduling the flush on a macrotask was implemented and benchmarked; it regressed `saveNote` to 6.6 ms because the deferral cost more than the rewrite it saved, so it was reverted. The measurement and the upgrade path (append-only `kv` log, or a per-store file) are recorded as a ponytail marker in `FileAdapter.ts`.
- **Save path re-attributed, and the remaining candidate profiled and rejected.** On a 300-note vault the attribution held: `Storage.set` is 63% of `saveNote` (1.15 ms total, 0.73 ms across the two sets) and everything else is 37%. The `bytesToHex` lookup table was measured on 1.9 MB at 76 ms against 215 ms for string concatenation and 149 ms for an array of pairs, so it stays. `bytesToBase64` (6.5 ms) and `base64ToBytes` (3.2 ms) are an order of magnitude cheaper than the hex path over the same payload, so they are not worth revisiting. An `Integrity.computeHash` hex lookup table was implemented and benchmarked, came out no faster than the existing loop (94.9 ms vs 90.6 ms over 200k calls), and was discarded. No further performance work is justified without a measured win.
- **The plaintext cache and the shared load are correctness fixes that also remove redundant work.** `getAllNotes` measured 3.52 ms cold, 1.70 ms on the second call, and 0.25-0.38 ms warm; decrypting all 300 notes measured 7.85 ms cold and ~4 ms warm. Sharing one in-flight load does not change these numbers, but it removes the discarded-read work that the previous behavior performed N times over.

### Changed
- **Landing redesigned in the Apple design language** (black canvas, SF-style type stack, #0071e3 accent, hairline dividers, sentence-case copy), replacing the glassmorphism theme; `glass*` CSS utilities removed in favor of `surface`/`btn-primary`/`link` primitives.
- **Local vs Vercel web split**: the web dashboard is identical (`/app` everywhere), while the landing page resolves asset/CTA URLs relative to the origin (localhost when run locally, `lembaranz.vercel.app` on Vercel), and `install.sh` references come from a single `SITE_URL` constant.
- **Key derivation restored to Argon2id** (`t=2`, `m=64 MiB`, `p=1`) with an automatic PBKDF2-HMAC-SHA-256 fallback that unlocks vaults and portable backups written by earlier releases and re-wraps them with Argon2id (note ciphertext untouched).
- **Docker/compose**: image entrypoint fixed (`launch` instead of the non-existent `mulai` argument); `compose.yaml` now mounts the vault volume and runs the TUI interactively.
- **`install.sh`** installs from source with Bun or npm and no longer references the non-existent `lembaranzz` package.
- **Dependencies pruned**: unused Next.js-era packages removed from the workspace.

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

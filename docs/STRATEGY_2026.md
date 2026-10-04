# Lembaranz Strategy, October 2026

> Rewritten after a flow audit and a competitor pass. The previous version was a
> list of technology pillars (Quantum Sovereignty, P2P Sync, The Agent Bridge).
> It described features. It did not answer the only question that matters, which
> is **why does this exist if Bitwarden and 1Password already do**.

---

## 1. The honest threat: the category is being absorbed

We were positioned as a password manager with better privacy. That is a losing
position, and not only because the incumbents are better funded.

**The login problem is being solved by the operating system.**

| Signal | Number | Consequence |
| --- | --- | --- |
| Passkeys in active use (2026) | ~5 billion | The thing a password manager stores is being replaced by a platform credential |
| People with at least one passkey | ~75% | It is now the default path, not the power-user path |
| Account-compromise rate with passkeys (Google) | 99.9% lower | There is no longer a security argument for holding passwords centrally |
| 1Password / Bitwarden pricing | ~$20 to $40 / year | They monetise a job that is becoming a free OS feature |

Building a better password store in 2026 means building a better shelf for
something that is leaving the room. Apple and Google ship passkey autofill for
free. "Remember my logins" is not a market with a future, it is a market with an
end date.

**The secrets problem has not been solved, and it is getting worse.**

| Signal | Number | Consequence |
| --- | --- | --- |
| Secrets leaked on public GitHub in a year | ~29 million | The leak surface is code, CI logs, and committed configuration |
| Leaked secrets from 2022 still valid | 64% | Old leaks are live breaches today |
| Organisations reporting secrets sprawl | 96% | Nobody has a single place these live |

## 2. The wedge

> **Passwords are becoming passkeys. Secrets are not.**

A password manager protects the credential you use to *log in*. It cannot hold
the things that *authenticate but do not log in*, because autofill wants a
username and a password field and most real credentials have neither.

What is in that gap:

- **Configuration verbatim.** A 40-line `.env` file has no field mapping, no
  character limit, and no autofill target. Password managers either refuse it or
  flatten it into an unsearchable note.
- **Keys with no username field.** API keys, service tokens, webhook secrets,
  SSH fingerprints, signing material, CI tokens.
- **Irreplaceable values.** Recovery codes, 2FA seeds, a mnemonic written on
  paper once. Held somewhere findable, with integrity checking.
- **Structured credentials**, for the times you *do* want a password manager to
  autofill them.

This is where Lembaranz should live. It is a niche only if it is "another local
vault". It is not a niche if it is the tool for the thing nobody serves.

## 3. Why not just use a competitor

These are architectural differences, not matters of taste, and they are the
answer to the question the old landing page could not answer.

| | Bitwarden / 1Password | Proton Pass | Lembaranz |
| --- | --- | --- | --- |
| Where the data lives | Their cloud. Self-hosting means running their server. | Their cloud, in Switzerland. | One process on your machine. No third party exists. |
| Built to hold | Structured login records with autofill. | Logins, then passkeys. | Free-form text and whole files, sized for configuration. |
| Who can read it | You, and anyone who compromises the vendor or your server. | You, Proton, and anyone who can compel them. | You. The key never leaves the process and is never written down. |
| Verifiable | Trust the vendor's audit. | Open source, but trust the operator for your data. | Per-entry SHA-256 seal, hash-chained ledger, re-verified live in the UI, and the source is small enough to read. |
| Handing over the device | Their product decides what the user sees. | Their product decides what the user sees. | Panic key destroys the vault on demand, and the destruction is itself an audited event. |
| Shell / SSH / CI | No. | No. | Yes. It is a CLI first. |
| Cost | Free tier, then ~$20 to $40 / year. | Free, then ~$36 / year. | Free forever, MIT, self-hosting included. |

The load-bearing row is **"where the data lives"**. Everyone else has already
answered that question with "their cloud". We have answered it with "there is no
cloud", and we should stop apologising for it.

## 4. What we are not going to do

Stated plainly, because a visitor who is turned away now is cheaper than a user
who is disappointed in week two, and because these limits are what make the
positioning credible.

- **No browser autofill.** If that is the reason you want a password manager,
  use 1Password or Bitwarden. They are better at it and they keep improving. A
  browser extension is a *distribution* play, not a *positioning* play, and it is
  the last thing we build because it makes us look like the thing we displace.
- **No sync, no phone app.** Data sovereignty and convenience point in opposite
  directions. We pick sovereignty.
- **No team or family sharing.** There are no accounts, so there is nothing to
  share with.
- **No consumer audience.** This is a tool for people who run systems.

## 5. The expansion path is upward, not outward

Adding a browser extension would push us into a fight we lose. The expansion that
works goes up the stack, away from storage and toward the place where breaches
actually happen.

### Phase 1 (now): a local vault for long-lived secrets
*Status: shipping.* AES-GCM 256-bit, Argon2id, a recovery phrase that is
generated and checksum-validated rather than typed in blind, a hash-chained
audit ledger the UI re-verifies, a panic key, and a CLI that works over SSH.

### Phase 2: leaked-secret detection and rotation
*This is the wedge into a real market.* Walk a user's repositories against public
leak corpora, tell them which exposed keys are still valid (64% of 2022 leaks
still are), and rotate them where the provider supports it. The vault stops being
storage and becomes the thing that closes the incident. No password manager will
build this: it is advisory software, not a password field, and it requires a
local, queryable inventory of what you hold.

### Phase 3: scoped credentials for AI agents
*This is the defensible position.* Agents need secrets, and handing an agent a
long-lived key is how this decade's breaches happen. The product becomes a
broker that issues a credential scoped to a host, a time window, and a single
operation, then expires it. That is the precise opposite of storing a permanent
secret, which is why it cannot be retrofitted into an incumbent's model.

### Phase 4 (optional): P2P sync, post-quantum backups
Local-first sync and post-quantum portability are real differentiators, but they
are *reinforcement* of Phase 1, not substitutes for Phases 2 and 3. They come
after the wedge, never before.

## 6. What was wrong with the user flow (audit, October 2026)

Found by running the real product end to end, not by reading the code. Every item
is fixed and covered by a test in `packages/server/src/__tests__/api.test.ts`.

| Problem | Effect on the user |
| --- | --- |
| Wrong password returned WebCrypto's "The operation failed for an operation-specific reason" | The most common event in the product produced a meaningless message |
| No recovery UI at all, despite `POST /recover` existing | A vault that advertised a recovery phrase it could never use. Forgotten password meant the web product was bricked |
| Setup took the recovery phrase as optional free text with no validation | A vault could be created whose only way back in was a typo |
| The "Env Manager" tab had two dead buttons and one hardcoded profile row | The product lied about having stored your secrets. Worst possible trust bug for a security tool |
| `if (res.data) setNotes(...)` ignored errors | Locking the vault silently emptied the list, with no way back in |
| Token had to be selected from terminal output and pasted by hand | The largest single drop-off between the landing page and a first note |
| `LEMBARANZ_PORT` was overwritten by the Commander default | The env var silently did nothing |
| `LEMBARANZ V3` hardcoded in four places, landing page said `v0.2.0` | Three different versions visible in one product |
| Setup on an existing vault reported success | Would orphan every note encrypted under the old master key |

## 7. Rules that follow from this

1. **Never ship a control that does not do what it says.** The dead Env Manager
   cost more trust than it earned features. If a button exists, it works.
2. **Every dead end needs an exit.** A locked vault, a forgotten password, a
   server that is not running: all three must have a visible next step.
3. **Error codes, not error prose.** The UI branches on `code`. Rewording a
   message must never break a flow.
4. **Recovery is not optional.** The setup flow will not complete without a valid
   phrase the user has confirmed they wrote down.
5. **Do not add features that pull us toward autofill.** That is the losing
   direction. Build things that depend on the key never leaving the machine.
# @lembaranz/cli

**Lembaranz CLI — a self-sovereign encrypted vault for your terminal.**

Official command-line interface and TUI for Lembaranz. Keep notes, ideas and
credentials on your machine, encrypted with AES-GCM 256-bit.

## Install

The packages are not published to npm yet, so install from source:

```bash
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install && bun link          # or: npm install && npm install -g .
```

## Usage

```bash
lembaranz                # launch the interactive TUI (default)
lembaranz setup          # interactive setup wizard (alias: init)
lembaranz launch         # enter TUI mode explicitly
lembaranz browse [term]  # searchable archive browser
lembaranz config         # configuration manager (alias: cfg)
lembaranz doctor         # diagnostics & health checks
lembaranz dashboard      # open the web dashboard
lembaranz import         # bulk credential import
lembaranz export         # encrypted portable backup
lembaranz monitor        # system health & integrity
lembaranz security       # security dashboard, audits & ledger status
```

## Security

- **Zero-knowledge**: your master password is never stored or transmitted.
- **Argon2id** (`t=2`, `m=64 MiB`, `p=1`): memory-hard key derivation.
  Vaults and backups created while PBKDF2 was the active KDF still unlock and
  are automatically re-wrapped with Argon2id.
- **AES-GCM 256-bit**: authenticated encryption for every entry.
- **Tamper-evident audit ledger**: hash-chained, local-only audit entries
  (`verifyChain()` reports the first broken link).
- **Local-first**: no cloud, no telemetry, no account.

## License

[MIT](https://github.com/Abelion512/lembaranz/blob/main/LICENSE)

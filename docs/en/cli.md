# Lembaranz CLI

The terminal interface to the vault: a full TUI plus single-purpose commands that
script cleanly.

> This page previously documented `lembaranz mulai`, `pantau`, `jelajah`,
> `pengaturan`, `petik`, and `tanam`. None of those commands exist in the CLI, and
> the install instructions pointed at an npm package that has never been
> published. Every command below is taken from `packages/cli/src/main.ts` and the
> `register*Command` functions it calls, and the command surface is asserted by
> `packages/cli/src/__tests__/commands.test.ts`. If a command here ever drifts
> from the binary, that test fails first.

## Install

Nothing is published to the npm registry yet, so install from source.

```bash
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz
bun install
```

To get a global `lembaranz` binary:

```bash
bun link          # from the cloned repository
```

Or skip the clone entirely:

```bash
curl -fsSL https://lembaranz.vercel.app/install.sh | bash
```

Docker is supported for the TUI:

```bash
docker compose run --rm lembaranz
```

## Commands

| Command | What it does |
|---------|--------------|
| `lembaranz` | Launch the TUI (default when no command is given) |
| `lembaranz setup` | Interactive setup wizard (alias: `init`) |
| `lembaranz launch` | Enter TUI mode directly |
| `lembaranz browse [keyword]` | Searchable archive browser |
| `lembaranz config` | Manage configurations, local `.env` values, and security hooks (alias: `cfg`) |
| `lembaranz doctor` | Security audit: entropy scan, leak detection, git safety |
| `lembaranz dashboard` | Serve the web dashboard locally |
| `lembaranz server` | Run the vault server the web UI connects to |
| `lembaranz import <path>` | Import `.md` files or restore a `.lembaranz` backup |
| `lembaranz export` | Write an encrypted portable backup |
| `lembaranz run <command...>` | Load a `.env` profile from the vault, then run a command with it |
| `lembaranz monitor` | System health and integrity |
| `lembaranz security` | Security dashboard, audits, and ledger status |
| `lembaranz --help` | Full command list |

### Notable flags

```bash
lembaranz server --open            # open the connect link in a browser
lembaranz server --port 5199       # or set LEMBARANZ_PORT
lembaranz server --host 0.0.0.0    # expose to the LAN, prints a warning
lembaranz doctor --deep            # scan file contents for high-entropy secrets
lembaranz doctor --fix             # attempt automatic repair
```

`LEMBARANZ_HOST`, `LEMBARANZ_PORT`, and `LEMBARANZ_WEB_URL` are the environment
equivalents for the `server` flags.

## Running a command with vault-loaded environment

`lembaranz run` injects a stored `.env` profile into the environment of the
command it then executes, so a project can run without a plaintext `.env` on
disk:

```bash
lembaranz run npm start                 # profile defaults to the directory name
lembaranz run -t staging npm test       # pick a profile with --tag
```

Bare arguments are forwarded here too, so `lembaranz npm start` is shorthand for
`lembaranz run npm start`.

## `config` subcommands

`config` is a group, not a single command:

```bash
lembaranz config show                    # every local configuration
lembaranz config get <key>               # one value
lembaranz config set <key> <value>       # write one value
lembaranz config save [tag]              # save the local .env into the vault
lembaranz config load [tag]              # load it back (alias: fetch)
lembaranz config list                    # stored .env profiles
lembaranz config hook                    # install the git pre-commit leak scanner
```

## TUI keys

| Key | Action |
|-----|--------|
| Arrow keys | Move through menus |
| Enter | Select |
| Esc / `q` | Back, then exit |
| Ctrl+C | Exit |
| `l` | Lock the vault |

There is no `/` shortcut. Search lives in `lembaranz browse` and in the
`browse` screen of the TUI.

## Backup and restore

```bash
lembaranz export                 # writes an encrypted .lembaranz archive
lembaranz import backup.lembaranz
```

Both paths are covered by tests in `packages/core/src/__tests__/`, and a backup
written by an older release still opens through the legacy PBKDF2 fallback.
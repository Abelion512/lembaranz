
Lembaran CLI is a faithful companion for developers. It is designed for speed, automation, and ease of integration into your terminal workflow.

## Installation

### Using Bun (highly recommended)
Bun is the fastest runtime for running Lembaran CLI.
```bash
bun install -g Abelion512/lembaran
```

### Using NPM
```bash
npm install -g Abelion512/lembaran
```

## Installation Troubleshooting

If you encounter a "Module not found" issue or the `lembaran` command refers to an old path (`abelion-notes`), perform a global cache cleanup:

```bash
bun remove -g abelion-notes lembaran
# OR if using npm
npm uninstall -g abelion-notes lembaran
```

After that, repeat the installation process.

## Running the CLI

After installation, the `lembaran` command will be available globally.

### 1. Interactive Mode (TUI)
Type the following command to enter the terminal's visual interface:
```bash
lembaran mulai
```

### 2. Direct Command Mode
You can also run specific commands without entering the main menu:
```bash
lembaran pantau    # View system status
lembaran jelajah   # Search for notes
```

## Aksara Shell Prompt

When you run `lembaran mulai`, you will enter the **Aksara Shell**. The prompt will change to `aksara ❯`. Here, you can type commands directly without the `lembaran` prefix.

Examples:
- `pantau`
- `jelajah "Server Config"`
- `ukir` (to create a new note)

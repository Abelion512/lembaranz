
Lembaranz CLI is a faithful companion for developers. It is designed for speed, automation, and ease of integration into your terminal workflow.

## Installation

### Using Bun (highly recommended)
Bun is the fastest runtime for running Lembaranz CLI.
```bash
bun install -g Abelion512/lembaranz
```

### Using NPM
```bash
npm install -g Abelion512/lembaranz
```

## Running the CLI

After installation, the `lembaranz` command will be available globally.

### 1. Interactive Mode (TUI)
Type the following command to enter the intuitive terminal interface:
```bash
lembaranz mulai
```
The TUI features non-looping navigation for precise control.

### 2. Direct Command Mode
You can also run specific commands without entering the main menu:
```bash
lembaranz pantau    # View system status
lembaranz jelajah   # Search for notes
lembaranz pengaturan # Manage .env configuration
```

## Configuration Command (pengaturan)

One of Lembaranz CLI's most powerful features is its ability to manage `.env` configurations directly without opening a text editor. This is extremely useful for quickly storing API credentials or project settings.

### Usage Examples:

1. **View all configurations:**
   ```bash
   lembaranz pengaturan
   ```
2. **View a specific value:**
   ```bash
   lembaranz pengaturan GEMINI_API_KEY
   ```
3. **Store/Update a value:**
   ```bash
   lembaranz pengaturan GEMINI_API_KEY "your-api-key-here"
   ```

## Long-term Retention & Security

Lembaranz is designed to keep your data safe and accessible for years to come:

1.  **Self-Backup**: Use the `petik` (export) command in the main menu to export your entire vault into a single encrypted `.lembaranz` file. Keep this file in a safe place (personal cloud or physical drive).
2.  **Easy Import**: If you change devices, simply install Lembaranz CLI and use the `tanam` (import) feature to restore your entire archive.
3.  **Local-First, Privacy-Always**: The `.lembaranz/` folder in your project root contains the local database. We've ensured this folder is automatically added to `.gitignore` when using the CLI, so your secrets will never accidentally leak to GitHub.
4.  **AI Sovereignty**: By using `lembaranz pengaturan`, you can easily switch AI providers (Gemini, etc.) at any time without changing application code.

---
*Created with ❤️ for those who crave digital freedom.*

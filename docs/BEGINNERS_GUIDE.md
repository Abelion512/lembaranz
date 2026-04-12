# 🚀 Beginner's Guide to Lembaran (For GUI Users)

> **Prefer GUI over terminal?** No problem! This guide is made for you.

---

## 📖 What is Lembaran? (Simple Explanation)

**Think of it like Bitwarden/1Password, but:**
- ✅ You host it yourself (no cloud)
- ✅ Works offline (data stays on your laptop)
- ✅ Zero-knowledge (even developers can't read your data)
- ✅ Made in Indonesia 🇮

**What you can store:**
- 🔑 API Keys (OpenAI, Stripe, AWS, etc.)
- 🔐 Passwords (database, admin panels)
- 🌐 .env files (project configurations)
- 🎫 Tokens (JWT, OAuth)
- 📝 Secret notes (recovery codes, seed phrases)

---

## ⚡ Quick Start (3 Easy Steps)

### Step 1: Setup Your Vault

Run this command in your terminal:

```bash
lembaran setup
```

You'll see an **interactive wizard** that guides you through:

1. **Create a strong password** (minimum 8 characters)
2. **Get your 12-word recovery phrase** ⚠️ **WRITE THIS DOWN ON PAPER!**
3. **Store your first credential** (optional)

> 💡 **Tip**: The 12-word phrase is like your "master key backup". If you forget your password, these words are the ONLY way to recover!

---

### Step 2: Store Your First Credential

After setup, you can add credentials in several ways:

#### **Option A: Using Setup Wizard** (Easiest)
When you run `lembaran setup`, it will ask if you want to store a credential right away.

#### **Option B: Using the TUI** (Visual Interface)
```bash
lembaran launch
```
This opens a **visual terminal interface** where you can:
- Navigate with arrow keys
- Add/edit/delete credentials
- Search by tags
- Export backups

#### **Option C: Using Simple Commands**
```bash
# Store an API key
lembaran settings API_KEY "sk-proj-abc123..."

# Check what you stored
lembaran settings
```

---

### Step 3: Use Your Credentials

When you need to use stored credentials:

```bash
# List all stored credentials
lembaran config list

# Load credentials to your current project
lembaran config load myproject

# Run a command with credentials injected
lembaran run --tag myproject npm start
```

---

## 🎨 Visual Guide: What You'll See

### When You Run `lembaran setup`

```
🚀 Lembaran Setup Wizard
Let's set up your secure credential vault in 3 easy steps.

📝 Step 1/3: Create Your Master Password
This password protects all your credentials. Make it strong!

? Enter a strong password: ********
? Confirm password: ********

🔑 Step 2/3: Your Recovery Phrase
⚠️  IMPORTANT: Write this down on PAPER!
If you forget your password, these 12 words are the ONLY way to recover.

┌─────────────────────────────────────────────────────────────────┐
│               YOUR 12-WORD RECOVERY PHRASE                      │
└─────────────────────────────────────────────────────────────────┘

   1. abandon     2. ability     3. able
   4. about       5. above       6. absent
   7. absorb      8. abstract    9. absurd
  10. abuse      11. access     12. accident

⚠️  NEVER share these words with anyone!
Store them in a safe place (like a physical safe or safety deposit box).

? I have written down the 12 words and stored them safely (y/N) › true
? Type the first 3 words to verify you saved them: › (y/N)
? Enter first 3 words: › abandon ability able

🔐 Step 3/3: Creating Your Vault...

✅ Vault created successfully!

🎉 You're all set!

What would you like to do next?
❯ 📝 Store your first credential
  📋 See all commands
  🚪 Exit
```

---

## 🎯 Common Tasks (Cheat Sheet)

| What You Want to Do | Command |
|---------------------|---------|
| **Setup vault** (first time) | `lembaran setup` |
| **Launch visual interface** | `lembaran launch` |
| **Store a credential** | `lembaran settings KEY "value"` |
| **View stored credentials** | `lembaran settings` |
| **List .env profiles** | `lembaran config list` |
| **Load credentials** | `lembaran config load myproject` |
| **Search credentials** | `lembaran browse api` |
| **Export backup** | `lembaran export` |
| **Get help** | `lembaran --help` |

---

## ❓ FAQ (Frequently Asked Questions)

### Q: I forgot my password! What do I do?
**A**: Use your 12-word recovery phrase:
```bash
lembaran launch
# Press 'r' when prompted
# Enter your 12 words
# Set a new password
```

### Q: Is my data safe?
**A**: Yes! Your data is encrypted with **AES-GCM 256-bit** (military-grade encryption). Even if someone steals your laptop, they can't read your data without your password.

### Q: Where is my data stored?
**A**: On your local machine only. No cloud, no server, no internet connection needed.

**Storage location:**
- **Linux/Mac**: `~/.lembaran/`
- **Windows**: `%APPDATA%/.lembaran/`

### Q: Can I backup my data?
**A**: Yes! Run:
```bash
lembaran export
```
This creates an encrypted `.lembaran` file that you can store safely (like on a USB drive).

### Q: How do I share credentials between projects?
**A**: Use tags! When saving:
```bash
lembaran config save projectA
lembaran config save projectB
```
Then load to any project:
```bash
cd /path/to/projectA && lembaran config load projectA
```

---

## 🎮 Interactive TUI Navigation

When you run `lembaran launch`, you'll see a visual interface. Here's how to navigate:

### Keyboard Shortcuts:
- **Arrow Keys** ↑↓ ←→ : Move selection
- **Enter** : Select/confirm
- **Esc** or **q** : Go back/exit
- **/** : Search
- **r** : Recovery mode (when locked)

### Main Menu:
```
╭────────────────────────────────────────────────────────╮
│  Gudang Aksara (Notes)                               │
│ 📂 Folder Manager                                      │
│ 🔑 Credential Manager                                  │
│ 🌐 Environment (.env) Manager                          │
│ 🔒 Security Settings                                   │
│ 📊 Monitor System                                      │
│ ❓ Help                                                │
╰────────────────────────────────────────────────────────╯
```

---

## 🛡️ Security Tips

### ✅ DO:
- ✅ Use a **strong password** (12+ characters, mix of letters/numbers/symbols)
- ✅ **Write down** your 12-word recovery phrase on paper
- ✅ Store recovery phrase in a **safe place** (safe, safety deposit box)
- ✅ **Export backups** regularly
- ✅ Use **different passwords** for different vaults

### ❌ DON'T:
- ❌ Share your password or recovery phrase
- ❌ Store recovery phrase digitally (no photos, screenshots, cloud)
- ❌ Use weak passwords (like "password123")
- ❌ Forget to backup
- ❌ Deploy web interface publicly (local testing only!)

---

## 🆘 Troubleshooting

### Problem: "command not found"
**Solution**: Reinstall globally:
```bash
cd /path/to/lembaran
bun link
```

### Problem: "Vault is locked"
**Solution**: Unlock with password or recovery phrase:
```bash
lembaran launch
# Enter password or press 'r' for recovery
```

### Problem: TUI shows errors
**Solution**: Use the setup wizard instead:
```bash
lembaran setup
```
This is more beginner-friendly and less error-prone.

### Problem: I want to start over
**Solution**: Destroy vault and create new:
```bash
lembaran setup
# Choose "Destroy and create new"
```
⚠️ **Warning**: This deletes ALL your data!

---

## 📚 Next Steps

Now that you've set up your vault, you can:

1. **Explore the TUI**: `lembaran launch`
2. **Read the full documentation**: `lembaran --help`
3. **Learn about recovery**: See `docs/RECOVERY_PHRASE.md`
4. **Understand the codebase**: See `docs/CODEBASE_GUIDE.md`

---

## 💬 Need Help?

- **GitHub Issues**: https://github.com/Abelion512/lembaran/issues
- **Email**: agen.salva@gmail.com
- **Documentation**: `lembaran --help`

---

**Made with ❤️ in Indonesia 🇮🇩**

*Last updated: April 2026 | Version 1.0.1*

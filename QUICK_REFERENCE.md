# 📋 Lembaranzz Quick Reference Card

> **Save this for quick access!**

---

## 🚀 Getting Started

```bash
# First time? Use the wizard
lembaranzz setup

# Or launch visual interface
lembaranzz launch
```

---

## 📝 Common Commands

| Task | Command |
|------|---------|
| **Setup vault** | `lembaranzz setup` |
| **Launch TUI** | `lembaranzz launch` |
| **Add credential** | `lembaranzz ukir` |
| **Load .env** | `lembaranzz muat` |
| **Search** | `lembaranzz browse` |
| **Security dashboard** | `lembaranzz security` |
| **Get help** | `lembaranzz --help` |

---

## 🔐 Security

- **Encryption**: AES-GCM 256-bit
- **Key Derivation**: Argon2id
- **Integrity**: SHA-256
- **Recovery**: 12-word mnemonic phrase

---

## 🎨 TUI Navigation

- **Arrow Keys**: Navigate
- **Enter**: Select
- **Esc / q**: Back/Exit
- **/**: Search
- **r**: Recovery mode

---

## 📁 Storage Location

- **Linux/Mac**: `~/.lembaranzz/`
- **Windows**: `%APPDATA%/.lembaranzz/`

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "command not found" | Run `bun link` in project folder |
| "Vault is locked" | Enter password or use recovery phrase |
| TUI errors | Use `lembaranzz setup` instead |
| Forgot password | Use 12-word recovery phrase |

---

## 📚 Documentation

- **Beginner's Guide**: `docs/BEGINNERS_GUIDE.md`
- **Recovery Phrase**: `docs/RECOVERY_PHRASE.md`
- **Codebase Guide**: `docs/CODEBASE_GUIDE.md`

---

**v3.5.0** | Made with ❤️ in Indonesia 🇮🇩

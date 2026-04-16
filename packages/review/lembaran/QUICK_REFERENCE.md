# 📋 Lembaran Quick Reference Card

> **Save this for quick access!**

---

## 🚀 Getting Started

```bash
# First time? Use the wizard
lembaran setup

# Or launch visual interface
lembaran launch
```

---

## 📝 Common Commands

| Task | Command |
|------|---------|
| **Setup vault** | `lembaran setup` |
| **Launch TUI** | `lembaran launch` |
| **Add credential** | `lembaran ukir` |
| **Load .env** | `lembaran muat` |
| **Search** | `lembaran browse` |
| **Security dashboard** | `lembaran security` |
| **Get help** | `lembaran --help` |

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

- **Linux/Mac**: `~/.lembaran/`
- **Windows**: `%APPDATA%/.lembaran/`

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "command not found" | Run `bun link` in project folder |
| "Vault is locked" | Enter password or use recovery phrase |
| TUI errors | Use `lembaran setup` instead |
| Forgot password | Use 12-word recovery phrase |

---

## 📚 Documentation

- **Beginner's Guide**: `docs/BEGINNERS_GUIDE.md`
- **Recovery Phrase**: `docs/RECOVERY_PHRASE.md`
- **Codebase Guide**: `docs/CODEBASE_GUIDE.md`

---

**v3.5.0** | Made with ❤️ in Indonesia 🇮🇩

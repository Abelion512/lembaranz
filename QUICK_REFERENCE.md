# 📋 Lembaranz Quick Reference Card

> **Save this for quick access!**

---

## 🚀 Getting Started

```bash
# First time? Use the wizard
lembaranz setup

# Or launch visual interface
lembaranz launch
```

---

## 📝 Common Commands

| Task | Command |
|------|---------|
| **Setup vault** | `lembaranz setup` |
| **Launch TUI** | `lembaranz launch` |
| **Web dashboard** | `lembaranz dashboard` |
| **Config vault** | `lembaranz config` |
| **Health check** | `lembaranz doctor` |
| **Search** | `lembaranz browse` |
| **Security dashboard** | `lembaranz security` |
| **Get help** | `lembaranz --help` |

---

## 🔐 Security

- **Encryption**: AES-GCM 256-bit
- **Key Derivation**: Argon2id (t=2, m=64 MiB, p=1) + PBKDF2 legacy fallback
- **Integrity**: SHA-256 per entry + hash-chained audit ledger
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

- **Personal vault**: `~/.lembaranz/personal.json` (Linux/macOS; `%APPDATA%` equivalent on Windows)
- **Project vault**: `./.lembaranz/project.json`
- **Docker (TUI)**: `docker compose run --rm lembaranz`

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "command not found" | Run `bun link` in project folder |
| "Vault is locked" | Enter password or use recovery phrase |
| TUI errors | Use `lembaranz setup` instead |
| Forgot password | Use 12-word recovery phrase |

---

## 📚 Documentation

- **Beginner's Guide**: `docs/BEGINNERS_GUIDE.md`
- **Recovery Phrase**: `docs/RECOVERY_PHRASE.md`
- **Codebase Guide**: `docs/CODEBASE_GUIDE.md`

---

**v0.2.0** (`@lembaranz/*` workspaces)

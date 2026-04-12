# @lembaranz/web - Web Interface (LOCAL TESTING ONLY)

## ⚠️ WARNING: DO NOT DEPLOY PUBLICLY

**This web interface is for LOCAL TESTING ONLY.**

### Why?

- The web interface handles credentials in the browser
- Unlike the CLI/TUI, credentials are decrypted in memory for display
- Public deployment could expose credentials to network attacks
- Designed to be self-hosted like **n8n** for internal testing

### Safe Usage

✅ **DO:**
- Run on `localhost:1400` for testing
- Use for development and debugging
- Access from local network only

❌ **DON'T:**
- Deploy to public servers (Vercel, Netlify, etc.)
- Expose to the internet
- Use as primary credential management interface

### Recommended Workflow

1. **Development**: `bun run dev` (localhost only)
2. **Testing**: Access at `http://localhost:1400`
3. **Production**: Use **CLI/TUI** instead (`lembaran launch`)

### Alternative

For production use, always use the **CLI/TUI** interface:
```bash
lembaran launch  # Interactive TUI (recommended)
lembaran config  # Manage credentials
```

---

**Remember**: Lembaran's primary interface is the terminal. The web UI is a development/testing tool only.

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-04-13

### Added
- **Landing Page Redesign**: Clean, install-first layout inspired by OpenCode.ai
- **Multi-Page Routing**: Separate pages for `/`, `/why`, `/faq`, `/docs`
- **Multiple Install Methods**: npm, bun, curl, docker, git clone
- **Dark Mode Toggle**: Light, dark, and system theme support
- **Control Orb**: Unified settings panel (Theme, Language, AI, MCP)
- **Branch `#33`**: All CI/CD workflows updated from `main` to `#33`

### Changed
- **Mobile UX Optimized**: Collapsible install commands on mobile
- **Version Reset**: All packages reset to 1.0.x after scope migration
- **README Simplified**: Clean, direct, no gimmick

### Fixed
- **Clone URL**: Fixed `YOUR_USERNAME` → `Abelion512/lembaran`
- **npm Ignore**: Internal folders excluded from publish
- **Tailwind Classes**: Deprecated syntax updated

---

## [1.0.0] - 2026-03-30

### Added
- **Scope Migration**: Migrated to `@lembaranz` organization scope
- **Package Reset**: Reset packages to stable `1.0.0`
- **Textual Lockfile**: Transitioned to `bun.lock` for auditability
- **Unified CLI**: Integrated `lembaran` command for monorepo ecosystem

---

## [3.5.0] - 2026-04-13 *(Pre-Reset)*

> Versions 3.0.0–3.5.0 were published under the legacy `lembaran` package name before scope migration to `@lembaranz`.

### Added
- **GitBook + Apple HIG Style**: Landing page redesign with AEO/GEO optimization
- **Beginner-Friendly Section**: 4-step guide for first-time users
- **JSON-LD Structured Data**: SoftwareApplication + FAQPage schema

### Changed
- **GUI vs Web Clarified**: Desktop GUI (Tauri) vs Web Dashboard (Docker)
- **All Workflows**: Updated from `main` to `#33` branch

---

## [3.4.0] - 2026-03-28

### Added
- **AI YOLO Mode**: Single-push security system for Git (auto-disable after 1 push)
- **Dependabot Configuration**: Auto-updates for npm + github-actions
- **PRD Refactor**: CLI/TUI focus, 75% progress

### Fixed
- **TypeScript**: ChildProcess typing in `Env.ts`
- **Web Vault**: Marked as CLI-only (deprecated for web)

### Removed
- **Web Vault UI**: Removed web vault feature

---

## [3.3.0] - 2026-02-22

### Added
- **Modern TUI Restoration**: Rebuilt interactive interface with Ink/React
- **Unlooping Scroll Logic**: Custom menu navigation without cursor wrapping
- **Settings Subcommand**: `lembaran pengaturan` for .env management

### Fixed
- **Emoji & Encoding**: Cleaned broken characters in terminal UI
- **Scrolling Trap**: Fixed viewport logic for full list scrolling

---

## [3.0.0–3.2.0] - 2026-02-18 to 2026-02-20

### Added
- **Vim Mode**: H/J/K/L navigation in editor
- **Biometric Auth**: WebAuthn simulation (Touch/FaceID)
- **Encrypted Vault (.lembaran)**: Backup exports with master key protection
- **Fuzzy Search**: Smart CLI search for quick access
- **Panic Key**: Emergency data wipe with passphrase
- **Session Timeout**: Auto-lock after inactivity

---

## [2.0.0–2.9.0] - 2026-02-17 to 2026-02-18

### Added
- **Dynamic Hero Section**: Cycling word titles
- **Installation Script**: `install.sh` for automated setup
- **Virtualized Lists**: `react-window` for handling thousands of notes
- **Smart Find Search**: Background indexing of encrypted content
- **Public Documentation**: Basic guides accessible without unlocking vault

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-05-11

### Fixed
- **File Persistence**: Fixed race condition and implemented atomic writes in `FileAdapter`.
- **Brand Unification**: Replaced all remaining "Lembaranz" references with "Lembaranz" in CLI and documentation.
- **CLI Syntax**: Fixed syntax errors in `TerminalUI` due to merge conflicts.
- **Senses Integration**: Added `Senses` module and unit testing from Jules session.

## [1.0.1] - 2026-04-13

### Added
- **Landing Page Redesign**: Clean layout focused on installation, inspired by OpenCode.ai.
- **Multi-Page Routing**: Separate pages for `/`, `/why`, `/faq`, and `/docs`.
- **Multiple Installation Methods**: npm, bun, curl, docker, and git clone.
- **Dark Mode Toggle**: Support for light, dark, and system themes.
- **Control Orb**: Unified settings panel (Theme, Language, AI, MCP).
- **Branch #33**: All CI/CD workflows updated from `main` to `#33`.

### Changed
- **Mobile UX Optimization**: Collapsible installation commands on mobile devices.
- **Version Reset**: All packages reset to 1.0.x after scope migration.
- **README Simplification**: Clean, direct, no gimmicks.

### Fixed
- **Clone URL**: Fixed `YOUR_USERNAME` → `Abelion512/lembaranz`.
- **npm Ignore**: Internal folders excluded from publication.
- **Tailwind Classes**: Updated deprecated syntax.

---

## [1.0.0] - 2026-03-30

### Added
- **Scope Migration**: Full migration to `@lembaranz` organization.
- **Package Reset**: All packages reset to stable release `1.0.0`.
- **Textual Lockfile**: Transition to `bun.lock` (text) for better auditability.
- **AEO/GEO Optimization**: Advanced SEO metadata optimization with JSON-LD and regional rich context.
- **Unified CLI**: Full integration of `lembaranz` commands for monorepo ecosystem.

---

## [3.5.0] - 2026-04-13 *(Pre-Reset)*

> Versions 3.0.0–3.5.0 were published under the old package name `lembaranz` before scope migration to `@lembaranz`.

### Added
- **GitBook + Apple HIG Style**: Landing page redesign with AEO/GEO optimization.
- **Beginner-Friendly Section**: 4-step guide for new users.
- **JSON-LD Structured Data**: SoftwareApplication + FAQPage schema.

### Changed
- **GUI vs Web Clarification**: Desktop GUI (Tauri) vs Web Dashboard (Docker).
- **All Workflows**: Updated from `main` branch to `#33`.

---

## [3.4.0] - 2026-03-28

### Added
- **AI YOLO Mode**: One-push security system for Git (automatically disabled after 1 push).
- **Dependabot Configuration**: Automatic updates for npm + github-actions.
- **PRD Refactor**: Focused on CLI/TUI, 75% progress.

### Fixed
- **TypeScript**: ChildProcess typing in `Env.ts`.
- **Web Vault**: Marked as CLI-only (deprecated for web).

### Removed
- **Web Vault UI**: Web vault feature removed.

---

## [3.3.0] - 2026-02-22

### Added
- **Modern TUI Restoration**: Rebuilt interactive interface with Ink/React.
- **Loopless Scroll Logic**: Custom menu navigation without cursor wrapping.
- **Setup Sub-command**: `lembaranz setup` for .env management.

### Fixed
- **Emoji & Encoding**: Cleaned up corrupted characters in terminal UI.
- **Scrolling Trap**: Fixed viewport logic for full list scrolling.

---

## [3.2.0] - 2026-02-20

### Added
- **Vim Mode**: H/J/K/L navigation in editor.
- **Biometric Authentication**: WebAuthn simulation (Touch/FaceID).
- **Encrypted Vault (.lembaranz)**: Backup export with master key protection.
- **Fuzzy Search**: Smart CLI search for quick access.
- **Panic Button**: Emergency data deletion with passphrase.
- **Session Expiry**: Auto-lock after inactivity.

---

## [2.0.0–2.9.0] - 2026-02-17 to 2026-02-18

### Added
- **Dynamic Hero Section**: Rotating word titles.
- **Installation Script**: `install.sh` for automated setup.
- **Virtual List**: `react-window` for handling thousands of notes.
- **Smart Find Search**: Background indexing of encrypted content.
- **Public Documentation**: Basic guides accessible without opening vault.

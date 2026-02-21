# Getting Started with Lembaran

Welcome to **Lembaran**, your poetic and secure personal archive platform. This guide will help you set up and start your journey towards data sovereignty.

## ⚡ Prerequisites

Before installing Lembaran, ensure you have the following tools installed on your system:

1.  **Bun Runtime**: The fastest JavaScript runtime.
    - [Download & Install Bun](https://bun.sh)
2.  **Git**: For version control and cloning the repository.
    - [Download & Install Git](https://git-scm.com)

## 🚀 Installation

### 1. Simple One-Line Install (Recommended)
Open your terminal and run:
```bash
curl -fsSL https://lembaran.vercel.app/install.sh | bash
```
*Note: For Windows users, make sure you have Git Bash installed to run this command.*

### 2. Manual Installation
If you prefer to set it up manually:
```bash
# Clone the repository
git clone https://github.com/Abelion512/lembaran.git
cd lembaran

# Install dependencies
bun install

# Install CLI globally
cd packages/cli
bun install -g .
```

## 🎭 First Run

Once installed, you can start the interactive terminal interface (TUI) by typing:
```bash
lembaran mulai
```

### Steps for First-Time Setup:
1.  **Initialize Vault**: The system will detect that your vault is uninitialized.
2.  **Create Password**: Choose a strong password. **Important:** We do not store your password. If you lose it, your data cannot be recovered.
3.  **Start Writing**: Use the `ukir` command or the web interface to save your first "Aksara" (note).

## 🌐 Web Interface

If you prefer a visual experience, you can run the web application:
```bash
bun run dev
```
Then open [http://localhost:1400](http://localhost:1400) in your browser.

## 📚 Learn More
- [CLI Command Reference](/bantuan/cli)
- [Security Architecture](/bantuan/keamanan)

# Getting Started with Lembaranz

Welcome to **Lembaranz**, your poetic and secure personal archive platform. This guide will help you set up and start your journey towards data sovereignty.

## ⚡ Prerequisites

Before installing Lembaranz, ensure you have the following tools installed on your system:

1.  **Bun Runtime**: The fastest JavaScript runtime.
    - [Download & Install Bun](https://bun.sh)
2.  **Git**: For version control and cloning the repository.
    - [Download & Install Git](https://git-scm.com)

## 🚀 Installation

### 1. Simple One-Line Install (Recommended)
Open your terminal and run:
```bash
curl -fsSL https://lembaranz.vercel.app/install.sh | bash
```
*Note: For Windows users, make sure you have Git Bash installed to run this command.*

### 2. Manual Installation
If you prefer to set it up manually:
```bash
# Clone the repository
git clone https://github.com/Abelion512/lembaranz.git
cd lembaranz

# Install dependencies and register CLI
bun install
bun link
```

## 🎭 First Run

Once installed, you can start the interactive terminal interface (TUI) by typing:
```bash
lembaranz mulai
```

### Steps for First-Time Setup:
1.  **Initialize Vault**: The system will detect that your vault is uninitialized.
2.  **Create Password**: Choose a strong password. **Important:** We do not store your password. If you lose it, your data cannot be recovered.
3.  **Start Writing**: Use the `ukir` command or the web interface to save your first "Aksara" (note).

3.  **Start Writing**: Use the `ukir` command to save your first "Aksara" (note).
- [CLI Command Reference](/bantuan/cli)
- [Security Architecture](/bantuan/keamanan)

#!/usr/bin/env bash
# Lembaranzz Installer — https://lembaranzz.sh
# Supports: Linux, macOS, WSL

set -euo pipefail

echo ""
echo "🚀 Installing Lembaranzz..."
echo ""

OS=$(uname -s)
ARCH=$(uname -m)

# OS Detection
if [[ "$OS" == "Linux" ]]; then
  if grep -qi microsoft /proc/version; then
    echo "✓ Detected: WSL"
  else
    echo "✓ Detected: Linux ($ARCH)"
  fi
elif [[ "$OS" == "Darwin" ]]; then
  echo "✓ Detected: macOS ($ARCH)"
else
  echo "✗ Unsupported OS: $OS"
  exit 1
fi

# Dependency Check
if ! command -v git &>/dev/null; then
  echo "✗ Error: git is required but not installed."
  exit 1
fi

# Check for package managers (bun > npm > brew)
if command -v bun &>/dev/null; then
  echo "✓ Package manager: bun"
  echo "↓ Installing globally via bun..."
  bun add -g lembaranzz
elif command -v npm &>/dev/null; then
  echo "✓ Package manager: npm"
  echo "↓ Installing globally via npm..."
  npm install -g lembaranzz
else
  echo "✗ Error: No package manager found. Please install node/npm or bun first."
  echo "  To install bun: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

echo ""
echo "✅ Lembaranzz installed successfully!"
echo "   Run 'lembaranz' to launch the TUI, or 'lembaranz setup' to initialize your vault."
echo ""

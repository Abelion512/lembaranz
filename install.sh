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

INSTALL_DIR="$HOME/.lembaranz"

echo "↓ Installing to $INSTALL_DIR..."

if command -v curl &>/dev/null; then
  echo "✓ Using curl..."
  if [ -d "$INSTALL_DIR" ]; then
    echo "  Directory $INSTALL_DIR already exists. Overwriting..."
    rm -rf "$INSTALL_DIR"
  fi
  mkdir -p "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  curl -fsSL https://github.com/Abelion512/lembaranz/archive/refs/heads/testing.tar.gz | tar -xz --strip-components=1
elif command -v git &>/dev/null; then
  echo "✓ Using git clone..."
  if [ -d "$INSTALL_DIR" ]; then
    echo "  Directory $INSTALL_DIR already exists. Updating..."
    cd "$INSTALL_DIR"
    git fetch --all && git reset --hard origin/testing
  else
    git clone -b testing https://github.com/Abelion512/lembaranz.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
else
  echo "✗ Error: Neither curl nor git is installed."
  exit 1
fi

echo "↓ Setting up dependencies via bun..."
if ! command -v bun &>/dev/null; then
  echo "✗ Error: bun is required. Please install it first:"
  echo "  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

bun install

echo ""
echo "✅ Lembaranzz installed successfully!"
echo "   To run Lembaranzz, please navigate to $INSTALL_DIR"
echo "   and run 'bun run cli setup' to initialize your vault."
echo ""

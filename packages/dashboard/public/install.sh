#!/usr/bin/env bash
# Lembaranz Installer — https://lembaranz.vercel.app
# Supports: Linux, macOS, WSL
#
# The packages are not published to the npm registry yet, so this installs
# straight from the public source repository and links the `lembaranz` binary.
#
# Bun is REQUIRED: workspace packages (@lembaranz/core, @lembaranz/cli) are
# resolved from this monorepo, which npm cannot do while they are unpublished.

set -euo pipefail

REPO_URL="https://github.com/Abelion512/lembaranz.git"
INSTALL_DIR="${LEMBARANZ_DIR:-$HOME/.lembaranz/src}"

echo ""
echo "🚀 Installing Lembaranz..."
echo ""

OS=$(uname -s)
ARCH=$(uname -m)

# OS Detection
if [[ "$OS" == "Linux" ]]; then
  if grep -qi microsoft /proc/version 2>/dev/null; then
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

# Dependency Check: git + bun (bun is mandatory — see header note)
if ! command -v git &>/dev/null; then
  echo "✗ Error: git is required but not installed."
  exit 1
fi

if ! command -v bun &>/dev/null; then
  echo "✗ Error: Bun is required but not installed."
  echo "  Lembaranz is a Bun monorepo; its unpublished workspace packages"
  echo "  cannot be resolved by npm. Install Bun first:"
  echo ""
  echo "    curl -fsSL https://bun.sh/install | bash"
  echo ""
  exit 1
fi

echo "✓ Package manager: bun"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  echo "↓ Updating existing source at $INSTALL_DIR..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  echo "↓ Fetching source into $INSTALL_DIR..."
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

echo "↓ Installing dependencies and linking the 'lembaranz' command..."
cd "$INSTALL_DIR"
bun install
bun link

echo ""
echo "✅ Lembaranz installed successfully!"
echo "   Run 'lembaranz' to launch the TUI, or 'lembaranz setup' to initialize your vault."
echo ""

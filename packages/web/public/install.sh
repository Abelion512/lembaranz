#!/bin/bash

# Lembaran CLI Installer (v3.5.0)
# "Aksara yang Berdikari"

set -e

# ANSI Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}--- Lembaran CLI Installer ---${NC}"

# Check for Bun (Preferred)
if command -v bun &> /dev/null; then
    echo -e "${GREEN}✓ Bun ditemukan. Menginstal via Bun...${NC}"
    bun install -g @abelionorg/cli
# Check for NPM
elif command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ NPM ditemukan. Menginstal via NPM...${NC}"
    npm install -g @abelionorg/cli
else
    echo -e "${RED}✗ Error: Bun atau Node.js/NPM tidak ditemukan.${NC}"
    echo "Sila pasang Bun (https://bun.sh) atau Node.js terlebih dahulu."
    exit 1
fi

echo -e "\n${GREEN}${BOLD}✓ Berhasil!${NC}"
echo -e "Ketik ${BLUE}lembaran --bantuan${NC} untuk mulai mengukir aksara."

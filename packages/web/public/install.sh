#!/bin/bash

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   LEMBARAN — Instalasi Aksara Personal Digital${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git tidak ditemukan.${NC}"
    echo "Silakan instal git terlebih dahulu."
    exit 1
fi

if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}Bun tidak ditemukan. Memulai instalasi Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

echo -e "${BLUE}Membersihkan instalasi lama jika ada...${NC}"
bun remove -g abelion-notes 2>/dev/null || true
bun remove -g lembaran 2>/dev/null || true

INSTALL_DIR="$HOME/.lembaran-source"
REPO_URL="https://github.com/Abelion512/lembaran.git"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Memperbarui source dari GitHub...${NC}"
    cd "$INSTALL_DIR"
    git pull origin main
else
    echo -e "${BLUE}Mengunduh source dari GitHub...${NC}"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

echo -e "${BLUE}Menyiapkan dependensi...${NC}"
bun install

echo -e "${BLUE}Menginstal Lembaran CLI secara global...${NC}"
cd packages/cli
chmod +x src/main.ts
bun install -g .

echo -e "\n${GREEN}INSTALASI BERHASIL!${NC}"
echo -e "Gunakan perintah: ${BLUE}lembaran mulai${NC}"

#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  RUN THIS FIRST if you get "node: command not found"
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${YELLOW}Fixing Node.js on Termux...${NC}"

# Update package list
pkg update -y 2>/dev/null | tail -3

# Try nodejs-lts first (most stable on Termux)
echo -e "${YELLOW}Installing nodejs-lts...${NC}"
pkg install nodejs-lts -y 2>/dev/null

# Check if it worked
if command -v node &>/dev/null; then
  echo -e "${GREEN}✅ Node $(node -v) installed!${NC}"
  echo -e "${GREEN}✅ NPM $(npm -v) installed!${NC}"
  echo ""
  echo -e "${GREEN}Now run: bash START.sh${NC}"
  exit 0
fi

# Try plain nodejs
echo -e "${YELLOW}Trying nodejs package...${NC}"
pkg install nodejs -y 2>/dev/null
if command -v node &>/dev/null; then
  echo -e "${GREEN}✅ Node $(node -v) installed!${NC}"
  exit 0
fi

# Try volta (node version manager)
echo -e "${YELLOW}Trying via curl install...${NC}"
curl https://get.volta.sh | bash 2>/dev/null
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
volta install node 2>/dev/null

if command -v node &>/dev/null; then
  echo -e "${GREEN}✅ Node $(node -v) via Volta!${NC}"
  # Add to .bashrc
  echo 'export VOLTA_HOME="$HOME/.volta"' >> ~/.bashrc
  echo 'export PATH="$VOLTA_HOME/bin:$PATH"' >> ~/.bashrc
  echo -e "${YELLOW}Run: source ~/.bashrc${NC}"
  exit 0
fi

echo -e "${RED}❌ Could not auto-install Node.js."
echo ""
echo "Manual fix — open a NEW Termux session and run:"
echo "  pkg install nodejs-lts"
echo ""
echo "If that fails (SSL errors) try:"
echo "  termux-change-repo"
echo "  (choose Grimler mirror)"
echo "  then: pkg install nodejs-lts"
echo -e "${NC}"

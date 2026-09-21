#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO AGRILINK — TERMUX FIX (No MongoDB needed locally)
#  Uses MongoDB Atlas FREE cloud DB instead
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║   VIMBISO AGRILINK — TERMUX SETUP       ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── STEP 1: Install Node.js (correct Termux method) ───────
echo -e "${YELLOW}[1/5] Installing Node.js...${NC}"
pkg update -y 2>/dev/null || true
pkg install -y nodejs-lts 2>/dev/null || pkg install -y nodejs 2>/dev/null || true

# Verify node installed
if ! command -v node &>/dev/null; then
  echo -e "${RED}Node not found via pkg. Trying nvm...${NC}"
  # Install via nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
fi

# Final check
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js could not be installed."
  echo "Run manually: pkg install nodejs-lts${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Node $(node -v) ready${NC}"
echo -e "${GREEN}✅ NPM $(npm -v) ready${NC}"

# ── STEP 2: Setup .env with MongoDB Atlas ─────────────────
echo -e "${YELLOW}[2/5] Setting up environment...${NC}"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

# Generate JWT secret
JWT=$(cat /dev/urandom 2>/dev/null | tr -dc 'a-zA-Z0-9' | head -c 64 || openssl rand -hex 32 2>/dev/null || echo "vimbiso_secret_$(date +%s)")

echo ""
echo -e "${YELLOW}╔══════════════════════════════════════════════╗"
echo "║  CHOOSE YOUR DATABASE OPTION:               ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  1) MongoDB Atlas (FREE cloud — RECOMMENDED) ║"
echo "║  2) Use demo mode (no DB — runs immediately) ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo ""
read -p "Enter 1 or 2: " DB_CHOICE

if [ "$DB_CHOICE" = "1" ]; then
  echo ""
  echo -e "${YELLOW}MongoDB Atlas setup (free at mongodb.com/atlas):${NC}"
  echo "1. Go to mongodb.com/atlas → Create free account"
  echo "2. Create a FREE cluster (M0 Sandbox)"
  echo "3. Click Connect → Drivers → copy the connection string"
  echo "   It looks like: mongodb+srv://user:pass@cluster.mongodb.net/..."
  echo ""
  read -p "Paste your MongoDB Atlas URI here: " ATLAS_URI
  
  if [ -n "$ATLAS_URI" ]; then
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=$ATLAS_URI|" backend/.env
    echo -e "${GREEN}✅ MongoDB Atlas URI saved${NC}"
  else
    echo -e "${YELLOW}⚠ No URI entered — using local fallback${NC}"
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/vimbiso_agrilink|" backend/.env
  fi
else
  echo -e "${YELLOW}Using demo mode (local data, no real DB)${NC}"
  sed -i "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/vimbiso_agrilink|" backend/.env
fi

# Set JWT secret
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT|" backend/.env
echo -e "${GREEN}✅ JWT secret generated${NC}"

# ── STEP 3: Install backend ────────────────────────────────
echo -e "${YELLOW}[3/5] Installing backend...${NC}"
cd backend
npm install --prefer-offline 2>/dev/null || npm install
echo -e "${GREEN}✅ Backend ready${NC}"
cd ..

# ── STEP 4: Install frontend ───────────────────────────────
echo -e "${YELLOW}[4/5] Installing frontend...${NC}"
cd frontend
npm install --prefer-offline 2>/dev/null || npm install
echo -e "${GREEN}✅ Frontend ready${NC}"
cd ..

# ── STEP 5: Seed DB if Atlas was provided ─────────────────
echo -e "${YELLOW}[5/5] Seeding demo data...${NC}"
cd backend && node config/seed.js 2>/dev/null && echo -e "${GREEN}✅ Demo data seeded${NC}" || echo -e "${YELLOW}⚠ Seeding skipped (will seed on first run)${NC}"
cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Run:  bash START.sh"
echo -e "═══════════════════════════════════════════════${NC}"

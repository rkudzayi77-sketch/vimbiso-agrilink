#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO AGRILINK — TERMUX DEPLOYMENT SCRIPT
#  Tested for Android Termux. Run this ONCE to set up.
#  Usage: bash DEPLOY_TERMUX.sh
# ═══════════════════════════════════════════════════════════

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║   VIMBISO AGRILINK — TERMUX SETUP    ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── STEP 1: Update & install packages ─────────────────────
echo -e "${YELLOW}[1/7] Installing system packages...${NC}"
pkg update -y && pkg upgrade -y
pkg install -y nodejs mongodb git curl

# ── STEP 2: Check Node version ────────────────────────────
echo -e "${YELLOW}[2/7] Checking Node.js...${NC}"
NODE_VER=$(node -v)
echo "Node: $NODE_VER"
NPM_VER=$(npm -v)
echo "NPM:  $NPM_VER"

# ── STEP 3: Create .env ────────────────────────────────────
echo -e "${YELLOW}[3/7] Setting up environment...${NC}"
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  # Generate a random JWT secret
  JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
  sed -i "s/vimbiso_change_this_secret_to_something_long_and_random/$JWT_SECRET/" backend/.env
  echo -e "${GREEN}✅ .env created with random JWT secret${NC}"
else
  echo "✅ .env already exists"
fi

# ── STEP 4: Install backend dependencies ──────────────────
echo -e "${YELLOW}[4/7] Installing backend dependencies...${NC}"
cd backend && npm install && cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# ── STEP 5: Install frontend dependencies ─────────────────
echo -e "${YELLOW}[5/7] Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# ── STEP 6: Start MongoDB ──────────────────────────────────
echo -e "${YELLOW}[6/7] Starting MongoDB...${NC}"
mkdir -p ~/data/db
mongod --dbpath ~/data/db --fork --logpath ~/data/mongod.log 2>/dev/null || echo "MongoDB may already be running"
sleep 2
echo -e "${GREEN}✅ MongoDB started${NC}"

# ── STEP 7: Seed the database ─────────────────────────────
echo -e "${YELLOW}[7/7] Seeding demo data...${NC}"
cd backend && node config/seed.js && cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════${NC}"
echo ""
echo "To START the app, run:  bash START.sh"
echo ""

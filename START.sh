#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO AGRILINK — START (Termux compatible)
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${GREEN}🚀 Starting Vimbiso AgriLink...${NC}"

# ── Fix: add common node paths for Termux ─────────────────
export PATH="$PATH:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -1)/bin"
export PATH="$PATH:/data/data/com.termux/files/usr/bin"

# ── Check node ────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js not found!"
  echo "Fix: pkg install nodejs-lts${NC}"
  exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}✅ Node $NODE_VER${NC}"

# ── Try to start MongoDB (optional — skip if Atlas) ───────
MONGO_URI=$(grep MONGODB_URI backend/.env 2>/dev/null | cut -d= -f2-)
if [[ "$MONGO_URI" == *"localhost"* ]]; then
  echo -e "${YELLOW}Starting local MongoDB...${NC}"
  mkdir -p ~/data/db
  mongod --dbpath ~/data/db --fork --logpath ~/data/mongod.log 2>/dev/null && \
    echo -e "${GREEN}✅ MongoDB started${NC}" || \
    echo -e "${YELLOW}⚠ MongoDB may already be running or use Atlas${NC}"
  sleep 1
else
  echo -e "${GREEN}✅ Using MongoDB Atlas (cloud DB)${NC}"
fi

# ── Get local IP ──────────────────────────────────────────
LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \K\S+' | head -1)
[ -z "$LOCAL_IP" ] && LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP="YOUR_PHONE_IP"

# ── Start backend ─────────────────────────────────────────
echo -e "${YELLOW}Starting backend API (port 5000)...${NC}"
cd backend
NODE_ENV=development node server.js > ~/vimbiso-backend.log 2>&1 &
BACK_PID=$!
cd ..
sleep 3

# Check backend started
if kill -0 $BACK_PID 2>/dev/null; then
  echo -e "${GREEN}✅ Backend running (PID $BACK_PID)${NC}"
else
  echo -e "${RED}❌ Backend failed to start. Check log: cat ~/vimbiso-backend.log${NC}"
  cat ~/vimbiso-backend.log | tail -20
  exit 1
fi

# ── Start frontend ────────────────────────────────────────
echo -e "${YELLOW}Starting frontend (port 3000)...${NC}"
cd frontend
npm run dev > ~/vimbiso-frontend.log 2>&1 &
FRONT_PID=$!
cd ..
sleep 4

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════════╗"
echo "║   🌿 VIMBISO AGRILINK IS LIVE!            ║"
echo "╚═════════════════════════════════════════════╝"
echo ""
echo "  📱 On this phone:"
echo "     http://localhost:3000"
echo ""
echo "  🌐 On other devices (same WiFi):"
echo "     http://$LOCAL_IP:3000"
echo ""
echo "  🔧 API:"
echo "     http://localhost:5000/api/health"
echo ""
echo "  📋 Demo logins (all PIN: 1234):"
echo "     Buyer:    +263771234561"
echo "     Vendor:   +263771234562"
echo "     Farmer:   +263771234563"
echo "     Delivery: +263771234564"
echo "     Agent:    +263771234565"
echo "     Admin:    +263771234566"
echo ""
echo "  📄 Logs:"
echo "     Backend:  cat ~/vimbiso-backend.log"
echo "     Frontend: cat ~/vimbiso-frontend.log"
echo ""
echo "  Press Ctrl+C to stop"
echo -e "═══════════════════════════════════════════════${NC}"

# Trap Ctrl+C
trap "echo ''; echo 'Stopping...'; kill $BACK_PID $FRONT_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT TERM
wait $BACK_PID

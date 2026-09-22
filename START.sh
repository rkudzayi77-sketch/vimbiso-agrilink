#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO AGRILINK — START SCRIPT (Termux)
#  Run this every time you want to start the server
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Vimbiso AgriLink...${NC}"

# Start MongoDB if not running
mkdir -p ~/data/db
mongod --dbpath ~/data/db --fork --logpath ~/data/mongod.log 2>/dev/null
echo -e "${GREEN}✅ MongoDB running${NC}"

# Get local IP for accessing from browser
LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}' || hostname -I | awk '{print $1}')

# Start backend in background
echo -e "${YELLOW}Starting backend API...${NC}"
cd backend
NODE_ENV=development node server.js &
BACKEND_PID=$!
cd ..
sleep 2

# Start frontend dev server
echo -e "${YELLOW}Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════"
echo "  🌿 VIMBISO AGRILINK IS RUNNING!"
echo "═══════════════════════════════════════════"
echo ""
echo "  📱 Open in browser (same phone):"
echo "     http://localhost:3000"
echo ""
echo "  🌐 Open on other devices (same WiFi):"
echo "     http://$LOCAL_IP:3000"
echo ""
echo "  🔧 API Endpoint:"
echo "     http://localhost:5000/api"
echo ""
echo "  📋 Demo logins (all PIN: 1234):"
echo "     Buyer:    +263771234561"
echo "     Vendor:   +263771234562"
echo "     Farmer:   +263771234563"
echo "     Delivery: +263771234564"
echo "     Agent:    +263771234565"
echo "     Admin:    +263771234566"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo -e "═══════════════════════════════════════════${NC}"
echo ""

# Keep running — Ctrl+C kills everything
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT
wait

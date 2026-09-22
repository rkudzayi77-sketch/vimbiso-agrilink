#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO AGRILINK — BUILD APK (Termux + Capacitor)
#  Converts the React web app to a real Android APK
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║   VIMBISO AGRILINK — APK BUILDER        ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check node
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js not found. Run: pkg install nodejs-lts${NC}"; exit 1
fi

# ── STEP 1: Build the React frontend ──────────────────────
echo -e "${YELLOW}[1/6] Building React frontend...${NC}"
cd frontend
npm install
VITE_API_URL="https://vimbiso-api.onrender.com" npm run build
echo -e "${GREEN}✅ Frontend built (dist/ folder ready)${NC}"
cd ..

# ── STEP 2: Install Capacitor ─────────────────────────────
echo -e "${YELLOW}[2/6] Installing Capacitor...${NC}"
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
echo -e "${GREEN}✅ Capacitor installed${NC}"

# ── STEP 3: Init Capacitor ────────────────────────────────
echo -e "${YELLOW}[3/6] Initialising Capacitor...${NC}"
npx cap init "Vimbiso AgriLink" "com.creatvate.vimbiso" --web-dir=dist 2>/dev/null || true
echo -e "${GREEN}✅ Capacitor initialised${NC}"

# ── STEP 4: Add Android platform ──────────────────────────
echo -e "${YELLOW}[4/6] Adding Android platform...${NC}"
npx cap add android 2>/dev/null || true
npx cap sync android
echo -e "${GREEN}✅ Android project created${NC}"
cd ..

# ── STEP 5: Check for Java ────────────────────────────────
echo -e "${YELLOW}[5/6] Checking Java / Gradle...${NC}"
if command -v java &>/dev/null; then
  echo -e "${GREEN}✅ Java found: $(java -version 2>&1 | head -1)${NC}"
  echo -e "${YELLOW}Building APK with Gradle...${NC}"
  cd frontend/android
  chmod +x gradlew
  ./gradlew assembleDebug 2>&1 | tail -20
  APK_PATH=$(find . -name "*.apk" -type f 2>/dev/null | head -1)
  if [ -n "$APK_PATH" ]; then
    cp "$APK_PATH" ~/vimbiso-agrilink.apk
    echo -e "${GREEN}✅ APK built! Saved to ~/vimbiso-agrilink.apk${NC}"
    cp "$APK_PATH" /sdcard/Download/vimbiso-agrilink.apk 2>/dev/null && echo -e "${GREEN}✅ Also copied to Downloads folder${NC}" || true
  fi
  cd ../..
else
  echo -e "${YELLOW}⚠ Java not found in Termux."
  echo -e "  Option A (Termux): pkg install openjdk-17"
  echo -e "  Option B (Recommended): Use GitHub Actions to build APK online${NC}"
  echo ""
  echo -e "${CYAN}  → Run: bash GITHUB_APK.sh"
  echo -e "    This pushes to GitHub and GitHub builds the APK for you.${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════"
echo " Done! Check ~/vimbiso-agrilink.apk"
echo -e "═══════════════════════════════════════════${NC}"

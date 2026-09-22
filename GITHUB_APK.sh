#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  VIMBISO — PUSH TO GITHUB → AUTO-BUILD APK (Free!)
#  GitHub Actions will build the APK in the cloud.
#  You download the APK from GitHub Releases.
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║   VIMBISO — GITHUB APK BUILD            ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Check git ─────────────────────────────────────────────
if ! command -v git &>/dev/null; then
  echo -e "${YELLOW}Installing git...${NC}"
  pkg install -y git
fi

# ── Get GitHub details ────────────────────────────────────
echo -e "${CYAN}You need a FREE GitHub account (github.com)${NC}"
echo ""
read -p "Your GitHub username: " GH_USER
read -p "Repository name (e.g. vimbiso-agrilink): " GH_REPO
read -s -p "GitHub Personal Access Token (github.com/settings/tokens): " GH_TOKEN
echo ""

if [ -z "$GH_USER" ] || [ -z "$GH_REPO" ] || [ -z "$GH_TOKEN" ]; then
  echo -e "${RED}❌ All fields required${NC}"; exit 1
fi

REMOTE_URL="https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"

# ── Init git if needed ────────────────────────────────────
if [ ! -d .git ]; then
  git init
  git config user.email "vimbiso@creatvate.co.zw"
  git config user.name "Vimbiso AgriLink"
fi

# ── Add .gitignore ────────────────────────────────────────
cat > .gitignore << 'GITEOF'
node_modules/
dist/
.env
*.log
uploads/*
!uploads/.gitkeep
android/
ios/
GITEOF

# ── Commit all files ─────────────────────────────────────
echo -e "${YELLOW}Staging files...${NC}"
git add -A
git commit -m "🌿 Vimbiso AgriLink v$(date +%Y%m%d-%H%M) — Full build" 2>/dev/null || \
git commit --allow-empty -m "🌿 Trigger APK build"

# ── Create repo on GitHub via API ─────────────────────────
echo -e "${YELLOW}Creating GitHub repository...${NC}"
curl -s -X POST \
  -H "Authorization: token ${GH_TOKEN}" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${GH_REPO}\",\"description\":\"Vimbiso AgriLink — Zimbabwe Informal Economy OS\",\"private\":false}" \
  > /dev/null

# ── Push to GitHub ────────────────────────────────────────
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git branch -M main
git push -u origin main --force

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════"
echo " ✅ CODE PUSHED TO GITHUB!"
echo "═══════════════════════════════════════════════════"
echo ""
echo -e " 🔨 GitHub is now BUILDING your APK automatically."
echo -e "    This takes about 5-8 minutes."
echo ""
echo -e " 📱 Download your APK here:"
echo -e "    ${CYAN}https://github.com/${GH_USER}/${GH_REPO}/releases${NC}"
echo ""
echo -e " 📊 Watch the build here:"
echo -e "    ${CYAN}https://github.com/${GH_USER}/${GH_REPO}/actions${NC}"
echo ""
echo -e " 🌐 Also deploying backend to Render.com:"
echo -e "    ${CYAN}https://render.com${NC} → New → Web Service"
echo -e "    Connect: github.com/${GH_USER}/${GH_REPO}"
echo -e "    Root dir: backend"
echo -e "    Build: npm install"
echo -e "    Start: node server.js"
echo -e "═══════════════════════════════════════════════════${NC}"

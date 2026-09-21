# 🌿 Vimbiso AgriLink
## Zimbabwe's Real-Time Informal Economy Operating System

> Built by CreatVate (Pvt) Ltd — Seke 1 Innovation Hub, Zimbabwe

---

## 📱 Running on Termux (Android — No PC needed)

### First time setup
```bash
# 1. Unzip the project
unzip vimbiso-agrilink.zip -d vimbiso
cd vimbiso

# 2. Run setup (installs everything)
bash DEPLOY_TERMUX.sh

# 3. Start the app
bash START.sh
```

Then open **http://localhost:3000** in your phone browser.

---

## 🖥️ Running on a PC / Server

### With Docker (easiest)
```bash
# 1. Copy .env.example to .env and edit values
cp .env.example .env

# 2. Start everything with Docker
docker-compose up -d

# 3. Seed demo data
docker-compose exec backend node config/seed.js
```
Open **http://localhost** in your browser.

### Without Docker
```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env      # edit with your MongoDB URI
npm install
node config/seed.js       # seed demo data
npm run dev               # starts on port 5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev               # starts on port 3000
```

---

## 🔑 Demo Logins (all PIN: 1234)
| Role | Phone |
|------|-------|
| 🛍 Buyer | +263771234561 |
| 🏪 Vendor | +263771234562 |
| 🌾 Farmer | +263771234563 |
| 🛵 Delivery | +263771234564 |
| 🤝 Agent | +263771234565 |
| ⚙ Admin | +263771234566 |

---

## 🚀 Deploy to Production (Render.com — Free)

### Backend
1. Push to GitHub
2. Go to render.com → New → Web Service
3. Connect your repo → select `backend` folder
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env.example`

### Frontend
1. Go to render.com → New → Static Site
2. Connect your repo → select `frontend` folder
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Set `VITE_API_URL` to your backend URL

---

## ✨ Features
- 🎙 **VoiceOrder** — Order by speaking Shona or Ndebele
- 💳 **TrustLoan** — Micro-credit based on Trust Score
- 🌦 **SmartHarvest AI** — Claude AI sell-now advisor for farmers
- 🔁 **GroupBuy** — Community bulk purchasing
- 📡 **MeshSync** — Peer-to-peer offline data sync

## 📦 Tech Stack
- **Frontend**: React 18, Vite, TanStack Query, Socket.IO client
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Auth**: JWT + bcrypt
- **Real-time**: WebSockets (Socket.IO)
- **AI**: Anthropic Claude API (SmartHarvest)

---

*CreatVate (Pvt) Ltd — Seke 1 High School Innovation Hub, Zimbabwe*

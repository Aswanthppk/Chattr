# Chattr. 💬

A modern, real-time random matchmaking chat web application inspired by clean, minimalist design principles. Connect instantly with strangers worldwide based on shared passions, custom hobbies, or purely spontaneous encounters.

---

## ✨ Features

- **Live Real-time Matchmaking**: Instant WebSocket pairing powered by Socket.IO & Express.
- **Zero-barrier Chat**: Connect with random people immediately with 0 topics selected, or pick and search for specific interests.
- **Custom Hobbies**: Type and add your own niche interests (e.g. *Photography*, *Mallu*, *Anime*, *Indie Game Dev*).
- **First-Character Dynamic Avatars**: Deterministic, vibrant gradient avatars displaying each person's initial, with real-time online status indicators.
- **Seamless Flow**: Direct transition from radar matchmaking straight into the active conversation without intermediate clicks.
- **Instant Skip**: Switch conversations effortlessly with one tap on the Skip button.
- **Icebreakers & Ambient Signals**: Curated conversation prompts, ambient live typing indicators, and delivery receipts.
- **Safety & Ephemeral Controls**: End-to-end ephemeral session drawer, blocking, and report tools.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Design Tokens**: Geist Sans typography, Material Symbols Outlined, curated lavender & charcoal color palette
- **Backend**: Node.js, Express, Socket.IO
- **Tooling**: PostCSS, Concurrently

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Chattr.git
cd Chattr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in Development Mode
Starts both the WebSocket backend (`http://localhost:3001`) and the Vite development server (`http://localhost:3000`):
```bash
npm run dev:all
```
Or start them individually:
```bash
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 3000
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run in Production
```bash
npm start
```
The server serves both the Socket.IO WebSocket server and the static SPA bundle.

---

## 📄 License
MIT License. Free to use and customize.

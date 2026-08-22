# 🎮 Steam Vault

> **Unified Multi-Account Steam Library & 1-Click Credential Manager**  
> Manage all your games across multiple Steam accounts in a single, authentic **Steam Client & Steam Deck** interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20RTDB-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Tests-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📌 Why Steam Vault?

Gamers and collectors managing multiple Steam accounts (e.g., main accounts, competitive smurfs, region-specific discount stores, or shared libraries) frequently face these challenges:
1. **Library Fragmentation**: Forgetting which account owns which game.
2. **Duplicate Purchases (*Overlap*)**: Owning the same game across multiple accounts.
3. **Friction in Account Switching**: Having to look up credentials and re-enter usernames and passwords manually.

**Steam Vault** aggregates your entire game collection into a unified, interactive dashboard. It clearly displays account ownership per game, provides **1-Click Copy Username & Password** actions, and offers **Direct Launch** to your local Steam client.

---

## ✨ Key Features

- **🔐 Google Authentication & Multi-Tenant Isolation**: Each user gets a private cloud vault securely isolated by their Google UID.
- **🌐 Guest Mode**: Visitors can immediately test and use the application locally without logging in.
- **🎮 Dual-View Interface**:
  - **Steam Desktop Client Mode** (Default): Vertical navigation sidebar on the left + cinematic widescreen Hero Stage on the right.
  - **Steam Deck Grid Mode**: High-density 2:3 capsule poster grid with a responsive slide-out detail drawer.
- **⚡ 1-Click Auto-Fill (Steam Store API)**: Simply enter a **Steam AppID** (e.g., `730` for CS2, `1091500` for Cyberpunk 2077) to automatically retrieve official **Game Titles, Genres/Tags, HD Vertical Posters (600x900), and Hero Banners**.
- **🔑 1-Click Credential Switching**: Copy username and password instantly with visual copy feedback and a show/hide password toggle (`👁️`).
- **🔄 Multi-Account Overlap Filter**: Instantly filter games owned on $\ge 2$ Steam accounts.
- **🚀 Direct Steam Launch**: One-click **Play / Launch** button that directly launches games in your local Steam client via `steam://rungameid/<appId>`.
- **☁️ Firebase Realtime Database**: 2-way real-time data sync with optimistic local caching for zero latency.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Database & Auth**: [Firebase Realtime Database](https://firebase.google.com/docs/database) & [Firebase Authentication (Google Sign-In)](https://firebase.google.com/docs/auth)
- **Testing**: [Playwright](https://playwright.dev/) (End-to-End Testing)

---

## 🚀 Getting Started & Self-Hosting

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/LuckDay21/steam-vault.git
cd steam-vault
npm install
```

### 2. Configure Firebase
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. In **Authentication** $\rightarrow$ **Sign-in method**, enable **Google**.
3. In **Realtime Database**, create a database in your preferred region (e.g., `asia-southeast1`).
4. In the **Rules** tab of Realtime Database, apply multi-tenant security rules:
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

```bash
# Run End-to-End test suite with Playwright
npx playwright test

# Run production build check
npm run build
```

---

## 🔒 Security & Privacy

- **Encrypted in Transit**: All communications use HTTPS and Secure WebSockets.
- **Isolated User Namespaces**: Firebase Security Rules ensure users can only read and write to `/users/{their_own_uid}/*`.

---

## 📄 License
Distributed under the [MIT](LICENSE) License.

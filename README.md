# 🎮 Steam Vault

> **Multi-Account Steam Library & Credential Manager** — Kelola seluruh koleksi game dari banyak akun Steam dalam satu antarmuka otentik bergaya **Steam Client & Steam Deck**.

---

## 📌 Masalah & Solusi

Bagi gamer yang memiliki lebih dari satu akun Steam (misal: akun utama, akun smurf kompetitif, atau akun khusus region tertentu), sering kali timbul masalah:
1. **Penyebaran Game**: Sulit mengingat di akun mana game tertentu berada.
2. **Game Duplikasi (*Overlap*)**: Beberapa akun memiliki game yang sama.
3. **Repot Ganti Akun**: Harus mengingat atau mencari kredensial login setiap ingin berganti akun.

**Steam Vault** menyatukan seluruh katalog game Anda ke dalam satu dashboard interaktif, menampilkan akun pemilik per game, menyediakan aksi **1-Click Copy Username & Password**, serta tombol **Direct Launch** ke aplikasi Steam lokal.

---

## ✨ Fitur Utama

- **🎮 Dual View Interface**:
  - **Steam Desktop Client Mode** (Default): Sidebar navigasi vertikal di kiri + Hero Stage sinematik widescreen di kanan.
  - **Steam Deck Grid Mode**: Tampilan katalog poster kapsul 2:3 high-density dengan drawer detail samping.
- **🔐 1-Click Credential Switching**: Salin Username dan Password dalam 1-klik dengan indikator visual dan opsi sembunyikan/tampilkan password (`👁️`).
- **⚡ Smart Auto-Cover Art**: Cukup masukkan **Steam AppID** (contoh: `730` untuk CS2, `1091500` untuk Cyberpunk 2077), poster HD vertikal & banner horizontal otomatis ditarik dari CDN resmi Steam.
- **🔄 Multi-Account Overlap Filter**: Filter khusus untuk mendeteksi game yang dimiliki di $\ge 2$ akun Steam.
- **🚀 Direct Steam Launch**: Tombol **Play / Launch** yang langsung membuka game di aplikasi Steam desktop via protokol `steam://rungameid/<appId>`.
- **☁️ Firebase Realtime Database Integration**: Sinkronisasi data realtime 2-arah yang aman dan otomatis dengan optimistic local cache (tidak ada lag UI).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
- **Testing**: [Playwright](https://playwright.dev/) (End-to-End Testing)

---

## 🚀 Memulai (Getting Started)

### 1. Clone Repository & Install Dependencies
```bash
git clone <url-repository-anda>
cd steam-vault
npm install
```

### 2. Setup Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi Firebase pada file `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Setup Rules di Firebase Console
Pastikan pada **Firebase Console** $\rightarrow$ **Realtime Database** $\rightarrow$ tab **Rules**:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🧪 Testing & Build

```bash
# Menjalankan End-to-End Tests dengan Playwright
npx playwright test

# Menjalankan Production Build
npm run build
```

---

## 📄 Lisensi
Distributed under the MIT License.

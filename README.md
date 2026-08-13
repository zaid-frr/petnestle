# PetNestle – AI-Powered Pet Care Platform

A modern, full-stack pet care management platform with an AI chatbot, service booking, provider directory, and real-time notifications. Built with React, TypeScript, Firebase, and Google Gemini API.

![PetNestle Banner](https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200&h=600)

---

## 🌟 Features

### Core Features
- ✅ **AI Pet Assistant** – ChatGPT-like interface powered by Google Gemini with multi-chat support
- ✅ **Service Booking** – Browse and book pet services (vets, trainers, daycare, etc.)
- ✅ **Provider Directory** – Find and connect with verified pet care professionals
- ✅ **Multi-Chat Memory** – Persistent chat history with named conversations (localStorage)
- ✅ **User Dashboard** – Personalized profile, booking history, and pet management
- ✅ **Real-time Notifications** – Firebase-backed notification system
- ✅ **Dark Mode** – Full dark theme support
- ✅ **Authentication** – Email/password and Google Sign-In via Firebase

### Security & Performance
- 🔒 **Server-Side API Key** – Gemini API key on Vercel serverless (never exposed to browser)
- 🔒 **Owner-Based Access Control** – Firestore security rules enforce data privacy
- 🚀 **Optimized Build** – Vite + React 19 for fast builds and HMR
- 📱 **Fully Responsive** – Mobile, tablet, and desktop optimized

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend/API** | Vercel Serverless Functions (Node.js) |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth (Email, Google) |
| **AI** | Google Gemini 1.5 Flash API |
| **Deployment** | Vercel + Firebase |

---

## 📦 Project Structure

```
petnestle/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context (Auth, Notifications, Chat Memory)
│   ├── pages/            # Route pages (Home, Chatbot, Dashboard, Services, etc.)
│   ├── lib/              # Utilities and mock data
│   ├── data/             # Static data and providers
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
├── api/
│   └── chat.ts           # Vercel serverless function for Gemini API
├── public/               # Static assets
├── server.js             # Local dev API server (for testing)
├── firestore.rules       # Firestore security rules
├── package.json          # Dependencies
├── vite.config.ts        # Vite config
├── tsconfig.json         # TypeScript config
└── vercel.json           # Vercel deployment config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Firestore enabled
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/zaid-frr/petnestle.git
cd petnestle
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Configure Firebase

Update `src/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

### 4. Run Locally

**Frontend only:**
```bash
npm run dev
```

**Frontend + Local API Server (for testing Gemini locally):**
```bash
npm run dev:all
```

Then visit: `http://localhost:3000/`

---

## 📋 Deployment Guide

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git push origin master
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Click "Deploy"

3. **Set Environment Variables in Vercel:**
   - Click "Settings" → "Environment Variables"
   - Add `GEMINI_API_KEY` with your actual key
   - Select all environments (Production, Preview, Development)
   - Click "Save"

4. **Redeploy to Apply Env Vars:**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

5. **Add Authorized Domains in Firebase:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `petnestle-xyz.vercel.app`)
   - Add `localhost:3000` for local dev

### Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## 🔐 Security Features

### 1. **API Key Protection**
- Gemini API key is **server-side only** on Vercel
- Never exposed to the browser
- Requests route through `/api/chat` serverless function

### 2. **Owner-Based Access Control**
Firestore rules enforce:
- Users can only read/edit **their own** documents
- Bookings can only be accessed by user or provider
- Pets can only be managed by owner
- Admins can override access

### 3. **Authentication**
- Email/password validation
- Google Sign-In support
- Session management with Firebase

---

## 📝 Firebase Setup

### Enable Services

1. **Firestore Database:**
   - Create in "Production mode"
   - Set region to closest to your users

2. **Authentication:**
   - Enable "Email/Password"
   - Enable "Google" provider

3. **Set Security Rules:**
   - Go to Firestore → Rules
   - Deploy rules from `firestore.rules` file

### Collections

```
users/                    # User profiles
├── {userId}
│   ├── email
│   ├── name
│   └── role

bookings/                 # Service bookings
├── {bookingId}
│   ├── userEmail
│   ├── providerEmail
│   ├── serviceName
│   └── date

pets/                     # User's pets
├── {petId}
│   ├── ownerEmail
│   ├── name
│   └── type

notifications/            # Real-time alerts
├── {notificationId}
│   ├── userEmail
│   ├── message
│   └── read

reviews/                  # Service reviews
├── {reviewId}
│   ├── userEmail
│   ├── rating
│   └── text
```

---

## 🤖 AI Chatbot Features

### Local Development
Run the local API server to test Gemini integration:
```bash
npm run dev:all
```

### Production (Vercel)
- Uses Vercel serverless function at `/api/chat`
- Automatically reads `GEMINI_API_KEY` from environment

### Chat Features
- **Multi-Chat Support** – Create, rename, delete conversations
- **Persistent History** – All chats saved in localStorage
- **Quick Actions** – Symptom Checker, Diet Advice, Vaccination Info
- **Markdown Support** – Rich text responses

---

## 🎨 Customization

### Update Branding
- Logo/icon: Replace images in `src/components/Layout.tsx`
- Colors: Modify Tailwind classes (currently teal/indigo theme)
- Site title: Update in `index.html` and `src/App.tsx`

### Add New Services
Edit `src/lib/mockData.ts` to add more service categories.

### Customize Chatbot Prompt
Update the system instruction in `api/chat.ts`:
```typescript
systemInstruction: "Your custom instruction here..."
```

---

## 📱 Features Breakdown

### Pages Included
- **Home** – Landing page with call-to-action
- **Services** – Browse all available pet services
- **Service Details** – Detailed view with pricing and benefits
- **Providers** – Find professionals by service type
- **Chatbot** – AI assistant with multi-chat UI
- **Dashboard** – User profile and bookings
- **About** – Company information
- **Tips** – Pet care tips and resources
- **Authentication** – Login & signup flows

---

## 🐛 Troubleshooting

### Chatbot Showing Error
1. Check API key in Vercel environment variables
2. Ensure Vercel deployment has been redeployed after adding env vars
3. For local dev, run `npm run dev:all` to start API server

### Firebase Auth Not Working
1. Add your domain to Authorized domains in Firebase Console
2. Check Firebase config in `src/firebase.ts`
3. Ensure authentication providers are enabled

### Firestore Permissions Denied
1. Deploy latest security rules: `firebase deploy --only firestore:rules`
2. Check user has correct email in Firestore `users` collection

---

## 📊 Performance Metrics

- **Build Time:** ~3-5s (Vite)
- **Page Load:** <2s (optimized assets)
- **Chatbot Response:** ~1-3s (Gemini API)
- **Database Queries:** Real-time with Firestore indexes

---

## 🤝 Support & Customization

For questions or custom modifications:
- 📧 Email: contact@petnestle.com
- 🐙 GitHub: [zaid-frr/petnestle](https://github.com/zaid-frr/petnestle)
- 📱 Website: [petnestle.vercel.app](https://petnestle.vercel.app)

---

## 📜 License

This project is provided as-is for educational and commercial use.

---

**Built with ❤️ for pet lovers everywhere.**

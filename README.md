
# 🚨 Vigilante AI - Smart Community Reporting

A next-generation citizen reporting platform that leverages **Gemini AI** to categorize and prioritize community safety incidents. DOCUMENT. REPORT. IMPROVE.

## 🌟 Key Features

- 🔐 **Google Authentication**: Secure sign-in for community members and administrators.
- 🗺️ **Interactive Leaflet Map**: Free, high-performance mapping for pinning incident locations without costly API fees.
- 🤖 **Gemini AI Core**: Automatic categorization, severity assessment, and professional summarization of user reports.
- 📸 **Cloud Evidence Storage**: Integrated Firebase Storage for uploading and serving high-resolution incident photos.
- 📄 **Official PDF Export**: Generate professional PDF reports for law enforcement or municipal authorities with one click.
- 📊 **Admin Command Center**: Real-time stats and global visibility for verified administrators.

## 🛠️ Technology Stack

- **Frontend**: React 19 (ESM), Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Leaflet.js (OpenStreetMap)
- **AI**: Google Gemini SDK (@google/genai)
- **Backend**: Firebase 12 (Auth, Firestore, Storage)
- **Reporting**: jsPDF

## 🚀 Deployment Instructions

### Prerequisites
1. A **Firebase Project** with Authentication (Google), Cloud Firestore, and Cloud Storage enabled.
2. A **Google Gemini API Key**.

### Configuration
1. Update `services/firebase.ts` with your unique Firebase configuration object.
2. Ensure the environment variable `process.env.API_KEY` is set to your Gemini API key.

### Static Hosting
This app is designed to be hosted on **GitHub Pages**, **Vercel**, or **Firebase Hosting**. 
Simply upload the root directory contents. The `index.html` file uses a modern Import Map for a buildless development and production experience.

## 🛡️ Admin Privileges
To enable Admin Mode, ensure your Google account email ends with `@teudominio.pt` or `@gmail.com` (configurable in `App.tsx`).

---
*Vigilante AI - Empowering Citizens to Protect their Community.*

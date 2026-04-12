# Zero Trust Authentication Platform

Welcome to the **Zero Trust Authentication Platform**! This repository hosts a modernized, high-performance web authentication framework emphasizing dynamic threat modeling, multi-factor authentication (MFA), and real-time security analytics.

## Core Features 🛡️
- **Risk Engine:** Heuristic-based telemetry scoring. Calculates an anomaly score (0-100) dynamically intercepting logins via impossible-travel math, device fingerprinting, and geolocation.
- **Adaptive MFA:** Intercepts high-risk network anomalies automatically, enforcing TOTP verification (powered by AES-256-GCM encrypted secrets) before returning Access Tokens.
- **Advanced Dashboarding:** Glassmorphic React UI hooked into Mongoose streams natively charting daily risk anomalies via `Chart.js`, complete with Active Session maps.
- **Scalable Architecture:** Fast internal caching leveraging native Express routing and Redis.

---

## 🛠️ Prerequisites

Before you start, ensure you have the following installed locally:
1. **Node.js** (v18+)
2. **MongoDB** (Install locally on port `27017` or use MongoDB Compass)
3. **Docker Desktop** (Required for the Redis high-speed rate limiter)

---

## 🚀 Quick Start Guide

### 1. Environment Setup
The backend requires specific encryption secrets. In the `/backend` folder, copy the skeleton configuration into a true `.env` file:
```bash
cp .env.example .env
```
*(Make sure the `MFA_ENCRYPTION_KEY` is a completely randomized 64-character hex string. Ask the platform architect if you need the master config).*

### 2. Boot Local Redis
To enable Rate Limiting and JWT blacklisting cleanly without dropping to memory fallbacks, spin up a lightweight Redis instance instantly in the background:
```bash
docker run -d --name zero-trust-redis -p 6379:6379 redis:alpine
```

### 3. Install Dependencies
You need to install the Node modules for **both** the backend and the frontend.
```bash
# In terminal 1
cd backend
npm install

# In terminal 2
cd frontend
npm install
```

### 4. Run the Platform
Start both servers locally:

**Start Backend (Port 5000)**
```bash
cd backend
npm run dev
```

**Start Frontend (Port 5173)**
```bash
cd frontend
npm run dev
```

---

## 🧪 How to Test and Demo

1. Open your browser to `http://localhost:5173`.
2. Click **Register** to create a fresh user account (this caches your browser as a trusted endpoint).
3. The platform will automatically route you to the **Security Center Dashboard**. 
4. Check out the **Telemetry** tab to see your connected system mapped live on the screen!
5. **Simulate a Threat:** Log into the same account using a different browser (like Edge instead of Chrome), or through a VPN or incognito window. The Risk Engine will detect the new fingerprint/IP and instantly block the attempt, demanding you setup MFA!

---

*Phase 6 & 7 Penetration testing toolsets are currently actively indexing in the main pipeline. Check branch logs for updates.*

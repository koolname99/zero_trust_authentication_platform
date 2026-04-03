# Cloud-Based Zero Trust Authentication Platform

This project is a modern, cloud-based Zero Trust Authentication Platform built to handle secure user authentication, risk-based adaptive actions, Multi-Factor Authentication (MFA), and active threat monitoring.

## Current Status

- **Phase 1: Project Scaffolding and Configuration** - Complete
  - Backend skeleton with Express, MongoDB, and Redis configuration is set up.
  - Frontend skeleton with React, Vite, React Router, and a full glassmorphism design system is set up.

*Please refer to `implementation.md` and `idea.md` for full technical specifications and the incremental build roadmap.*

---

## Getting Started (Local Development)

This system is organized as a monorepo consisting of a Node-based backend and a React-based frontend. Follow these instructions to run both locally.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Running locally on default port `27017` or configured via `.env`)
- *(Optional)* **Redis** for session management and rate limiting

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Make sure you check `.env.example` and create a `.env` file containing your local MongoDB URI and development secrets.
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`. You can verify it's working by hitting `http://localhost:5000/health`.*

### 3. Frontend Setup
1. Open a **second terminal** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Open this URL in your web browser to view the Security Dashboard.*

---

## Docker

- Start MongoDB and Redis in the background with `docker compose up -d`
- Stop them with `docker compose down`
- Stop and wipe all data with `docker compose down -v`

---

## Documentation
- **[implementation.md](./implementation.md)**: Contains the comprehensive technical roadmap, architectures, and the 8-phase deployment plan.
- **[idea.md](./idea.md)**: Contains the incremental step-by-step checklist guiding the ongoing active development.

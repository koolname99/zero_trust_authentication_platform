# Development Roadmap — Incremental Build Order

## Recommended Build Order

### Step 1: Backend Skeleton (Phase 1 - partial)
- Initialize `backend/package.json` with dependencies
- Create `server.js` with a basic Express app (just health check endpoint)
- Create `.env.example` and `config/environment.js`
- Create `config/db.js` (MongoDB connection)
- Create `utils/logger.js` (Winston)
- **Test:** Server starts, connects to MongoDB, `/health` returns 200

### Step 2: Frontend Skeleton (Phase 1 - partial)
- Scaffold React app with Vite in `frontend/`
- Set up the design system in `index.css` (dark theme, glassmorphism tokens)
- Create basic Layout components (`Navbar`, `Sidebar`, `Footer`)
- Set up React Router with placeholder pages
- **Test:** Frontend dev server runs, routing works, layout renders

### Step 3: Auth Core (Phase 2)
- User model, Session model, AuditLog model
- Auth service + token service (register, login, logout, refresh)
- Auth middleware, rate limiter
- Auth routes
- **Test:** Full register → login → get protected resource → refresh → logout flow via Postman/supertest

### Step 4: Auth UI (Phase 5 - partial)
- LoginForm, RegisterForm components
- AuthContext for state management
- Axios API service with interceptors
- ProtectedRoute component
- **Test:** End-to-end login/register from the browser

### Step 5: Risk Engine (Phase 3)
- RiskProfile model
- Risk scoring engine + geo service
- Risk evaluator middleware
- **Test:** Different login scenarios produce different risk scores

### Step 6: MFA (Phase 4)
- MFA service (TOTP, QR, recovery codes)
- MFA routes
- MFA UI components (Setup, Verify, RecoveryCodes)
- **Test:** Full MFA enrollment and verification flow

### Step 7: Dashboard (Phase 5 - remainder)
- SecurityOverview, RiskScoreChart, AttackLogTable, SessionMonitor
- MetricsCards, VulnerabilityPanel
- DashboardPage assembly
- **Test:** Dashboard renders with real data from the backend

### Step 8: Vuln Scanner + Attack Sim (Phases 6 & 7)
- Scanner service + routes
- Attack simulation service + routes
- Attack sim UI page
- Metrics service
- **Test:** Run scans and simulations, verify defenses work

### Step 9: Deployment (Phase 8)
- CI/CD pipelines
- AWS setup (EC2, Nginx, PM2)
- **Test:** App is live and accessible via HTTPS

---

## Key Advantages of This Order

1. Steps 1-2 give you a running app immediately (even with no features)
2. Steps 3-4 give you a working auth system you can test in the browser
3. Steps 5-6 layer security features on top of working auth
4. Steps 7-8 are the "showcase" features
5. Step 9 is deployment — only after everything works locally

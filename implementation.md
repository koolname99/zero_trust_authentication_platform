# Cloud-Based Zero Trust Authentication Platform -- Implementation Plan

## 1. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Security dashboard SPA |
| Charts | Chart.js / react-chartjs-2 | Risk score visualization, analytics |
| Backend | Node.js 20 + Express 4 | REST API, authentication logic |
| Database | MongoDB (Atlas or local) | User accounts, audit logs, risk profiles |
| Cache / Rate Limiting | Redis | Session tracking, rate limiting, token blacklisting |
| Authentication | JWT (jsonwebtoken) | Short-lived access tokens, refresh token rotation |
| MFA | speakeasy + qrcode | TOTP generation, QR enrollment |
| Security Scanning | Custom + OWASP ZAP (optional) | Vulnerability detection |
| Cloud | AWS (EC2, WAF, CloudWatch) | Production deployment |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 2. Project Directory Structure

```
zero_trust_authentication_platform/
|-- backend/
|   |-- config/
|   |   |-- db.js                  # MongoDB connection
|   |   |-- redis.js               # Redis client setup
|   |   |-- environment.js         # Environment variable validation
|   |-- middleware/
|   |   |-- authMiddleware.js      # JWT verification, session validation
|   |   |-- rateLimiter.js         # Redis-backed rate limiting
|   |   |-- riskEvaluator.js       # Per-request risk scoring middleware
|   |   |-- inputSanitizer.js      # XSS / injection prevention
|   |   |-- csrfProtection.js      # CSRF token middleware
|   |   |-- requestLogger.js       # Audit trail logging
|   |-- models/
|   |   |-- User.js                # User schema (credentials, MFA, devices)
|   |   |-- Session.js             # Session schema (token metadata, risk)
|   |   |-- AuditLog.js            # Security event log schema
|   |   |-- RiskProfile.js         # Per-user risk history
|   |   |-- VulnerabilityReport.js # Scan result schema
|   |-- routes/
|   |   |-- authRoutes.js          # Register, login, logout, refresh
|   |   |-- mfaRoutes.js           # MFA setup, verify, recovery codes
|   |   |-- dashboardRoutes.js     # Dashboard data endpoints
|   |   |-- attackSimRoutes.js     # Attack simulation triggers
|   |   |-- scanRoutes.js          # Vulnerability scan endpoints
|   |-- services/
|   |   |-- authService.js         # Core authentication logic
|   |   |-- tokenService.js        # JWT creation, rotation, blacklisting
|   |   |-- mfaService.js          # TOTP secret management, verification
|   |   |-- riskEngine.js          # Risk score calculation engine
|   |   |-- geoService.js          # IP geolocation lookup
|   |   |-- attackSimService.js    # Brute-force / stuffing / replay sim
|   |   |-- scannerService.js      # Vulnerability scanning logic
|   |   |-- metricsService.js      # Security metrics aggregation
|   |-- utils/
|   |   |-- crypto.js              # Encryption helpers (AES for secrets)
|   |   |-- validators.js          # Input validation schemas (Joi)
|   |   |-- constants.js           # App-wide constants
|   |   |-- logger.js              # Winston logger configuration
|   |-- tests/
|   |   |-- auth.test.js
|   |   |-- mfa.test.js
|   |   |-- riskEngine.test.js
|   |   |-- tokenService.test.js
|   |   |-- attackSim.test.js
|   |   |-- scanner.test.js
|   |-- server.js                  # Express app entry point
|   |-- package.json
|   |-- .env.example
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Dashboard/
|   |   |   |   |-- SecurityOverview.jsx
|   |   |   |   |-- RiskScoreChart.jsx
|   |   |   |   |-- AttackLogTable.jsx
|   |   |   |   |-- SessionMonitor.jsx
|   |   |   |   |-- VulnerabilityPanel.jsx
|   |   |   |   |-- MetricsCards.jsx
|   |   |   |-- Auth/
|   |   |   |   |-- LoginForm.jsx
|   |   |   |   |-- RegisterForm.jsx
|   |   |   |   |-- MFASetup.jsx
|   |   |   |   |-- MFAVerify.jsx
|   |   |   |   |-- RecoveryCodes.jsx
|   |   |   |-- Layout/
|   |   |   |   |-- Navbar.jsx
|   |   |   |   |-- Sidebar.jsx
|   |   |   |   |-- Footer.jsx
|   |   |   |-- Shared/
|   |   |   |   |-- AlertBanner.jsx
|   |   |   |   |-- LoadingSpinner.jsx
|   |   |   |   |-- ProtectedRoute.jsx
|   |   |-- pages/
|   |   |   |-- LoginPage.jsx
|   |   |   |-- RegisterPage.jsx
|   |   |   |-- DashboardPage.jsx
|   |   |   |-- AttackSimPage.jsx
|   |   |   |-- VulnerabilityScanPage.jsx
|   |   |   |-- SettingsPage.jsx
|   |   |-- services/
|   |   |   |-- api.js             # Axios instance with interceptors
|   |   |   |-- authService.js     # Login, register, refresh API calls
|   |   |   |-- dashboardService.js
|   |   |-- context/
|   |   |   |-- AuthContext.jsx    # Auth state management
|   |   |-- hooks/
|   |   |   |-- useAuth.js
|   |   |   |-- useRiskScore.js
|   |   |-- styles/
|   |   |   |-- index.css          # Global styles, design tokens
|   |   |   |-- dashboard.css
|   |   |   |-- auth.css
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |-- index.html
|   |-- vite.config.js
|   |-- package.json
|-- docs/
|   |-- vulnerability-report.md    # Scan findings documentation
|   |-- security-metrics.md        # Evaluation results
|   |-- architecture-diagram.md    # System architecture notes
|-- .github/
|   |-- workflows/
|   |   |-- ci.yml                 # CI pipeline
|   |   |-- deploy.yml             # CD pipeline to AWS
|-- .gitignore
|-- README.md
```

---

## 3. Implementation Phases

### Phase 1: Project Scaffolding and Configuration

**Goal:** Initialize both frontend and backend projects, configure databases, and establish the development environment.

#### [NEW] backend/package.json
- Initialize with `npm init`.
- Core dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `speakeasy`, `qrcode`, `ioredis`, `helmet`, `cors`, `dotenv`, `winston`, `joi`, `express-rate-limit`, `rate-limit-redis`, `cookie-parser`, `crypto-js`, `geoip-lite`, `ua-parser-js`.
- Dev dependencies: `jest`, `supertest`, `nodemon`.

#### [NEW] frontend (via Vite)
- Scaffold with `npx -y create-vite@latest ./ -- --template react`.
- Add dependencies: `react-router-dom`, `axios`, `chart.js`, `react-chartjs-2`, `react-icons`, `react-toastify`.

#### [NEW] backend/config/db.js
- Mongoose connection to MongoDB with retry logic.
- Connection event logging.

#### [NEW] backend/config/redis.js
- ioredis client with connection pooling.
- Graceful error handling and reconnection.

#### [NEW] backend/config/environment.js
- Validate all required environment variables on startup.
- Fail fast with descriptive errors for missing config.

#### [NEW] backend/.env.example
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zero_trust_auth
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_ACCESS_EXPIRY=5m
JWT_REFRESH_EXPIRY=7d
MFA_ENCRYPTION_KEY=<32-byte-hex-key>
NODE_ENV=development
```

#### Verification
- `npm install` succeeds in both `backend/` and `frontend/`.
- Backend starts and connects to MongoDB and Redis.
- Frontend dev server launches at `localhost:5173`.

---

### Phase 2: Zero Trust Authentication Core

**Goal:** Implement user registration, login, JWT-based authentication with short-lived tokens and refresh token rotation, and continuous session validation.

#### [NEW] backend/models/User.js
- Fields: `email` (unique, indexed), `passwordHash`, `role`, `mfaEnabled`, `mfaSecret` (encrypted), `recoveryCodes` (hashed), `knownDevices[]` (fingerprint, user agent, last seen), `riskProfile` (embedded or ref), `failedLoginAttempts`, `lockoutUntil`, `createdAt`, `updatedAt`.
- Pre-save hook for password hashing with bcrypt (salt rounds: 12).
- Instance method: `comparePassword(candidatePassword)`.

#### [NEW] backend/models/Session.js
- Fields: `userId` (ref), `refreshTokenHash`, `deviceFingerprint`, `ipAddress`, `userAgent`, `riskScoreAtCreation`, `isActive`, `createdAt`, `expiresAt`.
- TTL index on `expiresAt` for automatic cleanup.

#### [NEW] backend/models/AuditLog.js
- Fields: `userId`, `action` (enum: LOGIN_SUCCESS, LOGIN_FAILURE, TOKEN_REFRESH, MFA_VERIFY, LOGOUT, ACCOUNT_LOCKED, etc.), `ipAddress`, `userAgent`, `riskScore`, `metadata` (flexible object), `timestamp`.
- Capped collection or TTL index for log rotation.

#### [NEW] backend/services/tokenService.js
- `generateAccessToken(user)` -- signs JWT with 5-minute expiry, includes `userId`, `role`, `sessionId`, `iat`. 
- `generateRefreshToken(user, sessionId)` -- signs JWT with 7-day expiry, stores hashed version in Session collection.
- `rotateRefreshToken(oldToken)` -- invalidates old token, issues new pair. Detects reuse of invalidated tokens (token family tracking) and revokes entire family on reuse detection.
- `blacklistToken(jti)` -- adds token ID to Redis with TTL matching token expiry.
- `isBlacklisted(jti)` -- checks Redis for blacklisted token.

#### [NEW] backend/services/authService.js
- `register(email, password)` -- validates input, checks for existing user, hashes password, creates user, returns tokens.
- `login(email, password, deviceInfo)` -- validates credentials, checks account lockout, evaluates risk score, determines if MFA is required, creates session, returns tokens or MFA challenge.
- `logout(sessionId, accessTokenJti)` -- invalidates session, blacklists current access token.
- `refreshTokens(refreshToken)` -- validates refresh token, checks session, performs rotation, returns new token pair.

#### [NEW] backend/middleware/authMiddleware.js
- Extracts JWT from `Authorization: Bearer <token>` header.
- Verifies signature, expiry, and checks blacklist in Redis.
- Validates that the associated session is still active in MongoDB.
- Attaches `req.user` with decoded payload.
- Rejects with 401 on any validation failure.

#### [NEW] backend/routes/authRoutes.js
- `POST /api/auth/register` -- rate limited (5 per hour per IP).
- `POST /api/auth/login` -- rate limited (10 per minute per IP).
- `POST /api/auth/logout` -- authenticated.
- `POST /api/auth/refresh` -- rate limited (30 per hour).
- All routes produce AuditLog entries.

#### [NEW] backend/middleware/rateLimiter.js
- Redis-backed rate limiter using `rate-limit-redis`.
- Configurable windows and limits per route.
- Returns `429 Too Many Requests` with `Retry-After` header.

#### [NEW] backend/middleware/requestLogger.js
- Logs every request: method, path, IP, user agent, response status, response time.
- Writes to both Winston file transport and AuditLog for authenticated requests.

#### Verification
- Unit tests for tokenService (generation, rotation, blacklisting, reuse detection).
- Integration tests for register/login/logout/refresh flows via supertest.
- Verify that expired tokens are rejected.
- Verify that reused refresh tokens trigger family revocation.
- Verify rate limiting returns 429 after threshold.

---

### Phase 3: Risk-Based Authentication Engine

**Goal:** Build a risk scoring engine that evaluates each authentication attempt and ongoing sessions, triggering adaptive security responses.

#### [NEW] backend/models/RiskProfile.js
- Fields: `userId` (ref), `baselineRiskScore`, `loginHistory[]` (timestamp, ip, geo, device, outcome, riskScore), `knownIPs[]`, `knownGeoLocations[]`, `knownDevices[]`, `anomalyCount`, `lastUpdated`.

#### [NEW] backend/services/riskEngine.js
Core function: `calculateRiskScore(userId, requestContext)` returns a score from 0-100.

Risk factors and weights:

| Factor | Weight | Condition |
|---|---|---|
| New Device | +25 | Device fingerprint not in known devices |
| New IP Address | +15 | IP not in user's known IPs |
| New Geolocation | +20 | Country/region not in known locations |
| Impossible Travel | +30 | Login from distant location within impossible timeframe |
| Failed Login Streak | +5 per failure | Recent consecutive failures (capped at +25) |
| Unusual Login Time | +10 | Login outside user's typical hours (2 std devs) |
| Known Malicious IP | +35 | IP found in threat intelligence list |
| Velocity Anomaly | +20 | Requests per minute exceed 3x user baseline |
| TOR/VPN Exit Node | +15 | IP matches known anonymizer |

Adaptive response thresholds:

| Risk Score | Action |
|---|---|
| 0-25 | Allow, no additional verification |
| 26-50 | Require MFA verification |
| 51-75 | Require MFA + email confirmation |
| 76-100 | Block login, lock account, alert admin |

- After each login, update RiskProfile with new data points.
- Maintain a rolling window of login history (last 90 days).

#### [NEW] backend/services/geoService.js
- Uses `geoip-lite` for IP-to-location resolution.
- `getLocation(ip)` -- returns `{ country, region, city, latitude, longitude }`.
- `calculateDistance(loc1, loc2)` -- Haversine formula for impossible travel detection.
- `isTorExitNode(ip)` -- checks against cached TOR exit node list (refreshed daily).

#### [NEW] backend/middleware/riskEvaluator.js
- Runs after authentication but before granting access.
- Calls `riskEngine.calculateRiskScore()` with current request context.
- Attaches `req.riskScore` to the request.
- If score exceeds threshold, returns appropriate challenge or block response.

#### Verification
- Unit tests for riskEngine with mocked scenarios (new device, new geo, impossible travel, streak of failures).
- Verify score thresholds trigger correct adaptive responses.
- Test impossible travel detection with synthetic timestamps and coordinates.
- Test that known devices/IPs reduce risk score over time.

---

### Phase 4: Multi-Factor Authentication (MFA)

**Goal:** Implement TOTP-based MFA with QR enrollment, encrypted secret storage, backup recovery codes, and replay protection.

#### [NEW] backend/services/mfaService.js
- `generateSecret(user)` -- creates TOTP secret via `speakeasy`, encrypts with AES-256-GCM using `MFA_ENCRYPTION_KEY`, stores cipher + IV + auth tag in User document.
- `generateQRCode(secret, email)` -- creates otpauth:// URI, generates QR code as data URL via `qrcode` library.
- `verifyToken(user, token)` -- decrypts stored secret, verifies TOTP token via `speakeasy.totp.verify()` with a window of 1 (allows 30-second drift).
- `generateRecoveryCodes(count=10)` -- generates 10 single-use recovery codes, stores bcrypt hashes in User document.
- `verifyRecoveryCode(user, code)` -- checks code against stored hashes, removes used code.
- `isReplay(userId, token)` -- stores last-used OTP in Redis with 90-second TTL. Rejects if same token is submitted within window.

#### [NEW] backend/routes/mfaRoutes.js
- `POST /api/mfa/setup` -- authenticated. Returns QR code data URL and backup codes.
- `POST /api/mfa/verify` -- verifies TOTP token during login challenge.
- `POST /api/mfa/recovery` -- verifies recovery code as MFA fallback.
- `POST /api/mfa/disable` -- authenticated + password confirmation. Removes MFA.

#### Updates to backend/services/authService.js
- Modify `login()` flow: if user has MFA enabled OR risk score demands MFA, return a `mfaRequired: true` response with a short-lived MFA session token (2 minutes) instead of full access tokens.
- After MFA verification, complete the login and issue full tokens.

#### Verification
- Unit tests for secret encryption/decryption roundtrip.
- Test QR code generation produces valid otpauth:// URI.
- Test that valid TOTP tokens are accepted within window.
- Test that replayed tokens are rejected.
- Test recovery code usage and single-use enforcement.
- Integration test of full login-with-MFA flow.

---

### Phase 5: React Security Dashboard (Frontend)

**Goal:** Build a polished, responsive React dashboard with glassmorphism design, real-time data visualization, and full integration with the backend API.

#### [NEW] frontend/src/styles/index.css
Design system:
- Dark mode base: `#0a0a1a` background, glass panels with `rgba(255,255,255,0.05)` backgrounds and `backdrop-filter: blur(12px)`.
- Accent palette: cyan `#00d4ff`, purple `#7c3aed`, emerald `#10b981`, rose `#f43f5e`.
- Typography: Inter font from Google Fonts (400, 500, 600, 700 weights).
- CSS custom properties for all design tokens.
- Smooth transitions: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
- Glass card component: semi-transparent background, subtle border, box-shadow glow.
- Keyframe animations: fade-in, slide-up, pulse-glow, shimmer-loading.

#### [NEW] frontend/src/context/AuthContext.jsx
- Stores `user`, `accessToken`, `isAuthenticated`, `mfaPending` state.
- `login()`, `register()`, `logout()`, `refreshToken()` methods.
- Axios interceptor for automatic token refresh on 401 responses.
- Persists refresh token in httpOnly cookie (set by backend).

#### [NEW] frontend/src/components/Auth/LoginForm.jsx
- Email and password inputs with validation.
- Handles normal login and MFA challenge flow.
- Displays risk score feedback to user after login.
- Error handling with animated toast notifications.

#### [NEW] frontend/src/components/Auth/RegisterForm.jsx
- Email, password, confirm password with client-side validation.
- Password strength meter (visual bar with color gradient).
- Automatic redirect to MFA setup after registration.

#### [NEW] frontend/src/components/Auth/MFASetup.jsx
- Displays QR code for Google Authenticator scanning.
- Verification input to confirm setup.
- Displays backup recovery codes with copy/download option.

#### [NEW] frontend/src/components/Auth/MFAVerify.jsx
- 6-digit OTP input with auto-focus and auto-submit.
- Countdown timer showing MFA session expiry.
- Link to use recovery code instead.

#### [NEW] frontend/src/components/Dashboard/SecurityOverview.jsx
- Summary cards: total users, active sessions, blocked attempts (24h), average risk score.
- Cards use glassmorphism styling with icon accents.
- Animated counters on mount.

#### [NEW] frontend/src/components/Dashboard/RiskScoreChart.jsx
- Line chart (Chart.js) showing risk score trends over time.
- Color-coded zones (green/yellow/orange/red) matching risk thresholds.
- Tooltip with detailed event info.
- Toggle between 24h, 7d, 30d views.

#### [NEW] frontend/src/components/Dashboard/AttackLogTable.jsx
- Paginated table of recent security events.
- Columns: timestamp, event type, source IP, risk score, outcome.
- Color-coded severity badges.
- Click to expand for full event details.
- Auto-refresh every 10 seconds.

#### [NEW] frontend/src/components/Dashboard/SessionMonitor.jsx
- List of active sessions with device info, IP, location, risk score.
- Ability to terminate individual sessions.
- Highlight current session.

#### [NEW] frontend/src/components/Dashboard/VulnerabilityPanel.jsx
- Displays latest scan results grouped by severity (Critical, High, Medium, Low).
- Expandable details for each finding.
- Button to trigger new scan.

#### [NEW] frontend/src/components/Dashboard/MetricsCards.jsx
- Brute-force mitigation rate (percentage).
- False positive rate of risk engine.
- Average token compromise detection time.
- System response time under load.
- Each card with a mini sparkline chart.

#### [NEW] frontend/src/pages/DashboardPage.jsx
- Grid layout assembling all dashboard components.
- Responsive: 3-column on desktop, 2-column on tablet, 1-column on mobile.
- Sidebar navigation.

#### [NEW] frontend/src/pages/AttackSimPage.jsx
- Controls to launch simulated attacks (brute-force, credential stuffing, JWT tampering).
- Real-time log stream showing attack progress and system responses.
- Results summary with pass/fail status for each defense mechanism.

#### [NEW] frontend/src/pages/VulnerabilityScanPage.jsx
- Trigger scans, view historical reports.
- Scan progress indicator.
- Downloadable PDF/Markdown reports.

#### [NEW] frontend/src/components/Shared/ProtectedRoute.jsx
- Wraps routes requiring authentication.
- Redirects to login if no valid session.
- Checks token validity before rendering.

#### Verification
- Frontend builds without errors: `npm run build`.
- All pages render correctly at desktop and mobile breakpoints.
- Login/register/MFA flows work end-to-end with the backend.
- Dashboard charts render with mock or real data.
- Session termination from the dashboard works correctly.

---

### Phase 6: Vulnerability Detection System

**Goal:** Build automated scanning capabilities for common web vulnerabilities, targeting the platform's own authentication endpoints.

#### [NEW] backend/models/VulnerabilityReport.js
- Fields: `scanId`, `scanType` (enum: SQL_INJECTION, XSS, CSRF, MISCONFIGURATION, FULL), `target` (URL/endpoint), `findings[]` (severity, title, description, evidence, remediation), `startedAt`, `completedAt`, `status` (RUNNING, COMPLETED, FAILED).

#### [NEW] backend/services/scannerService.js
Implements white-box scanning modules:

- **SQL Injection Scanner:**
  - Tests authentication endpoints with common SQL injection payloads (`' OR 1=1 --`, `'; DROP TABLE`, union-based, blind boolean).
  - Analyzes responses for error message leakage, unexpected data returns, timing differences.
  - Tests parameterized query enforcement.

- **XSS Scanner:**
  - Injects script payloads into all user-facing input fields (`<script>alert(1)</script>`, event handlers, encoded variants).
  - Checks if payloads are reflected in responses without sanitization.
  - Tests Content-Security-Policy header presence and effectiveness.

- **CSRF Scanner:**
  - Verifies CSRF tokens are required on state-changing endpoints.
  - Tests token validation (missing, invalid, expired tokens).
  - Checks SameSite cookie attributes.

- **Security Misconfiguration Scanner:**
  - Checks HTTP security headers (Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, Referrer-Policy).
  - Verifies that error messages do not leak stack traces or internal paths.
  - Checks for exposed debug endpoints or default credentials.
  - Validates CORS configuration.

#### [NEW] backend/routes/scanRoutes.js
- `POST /api/scans/run` -- authenticated, admin only. Params: `scanType`, `target`.
- `GET /api/scans/:scanId` -- get scan status and results.
- `GET /api/scans/history` -- paginated list of past scans.

#### Verification
- Run each scanner module against the platform's own endpoints.
- Verify that known-safe endpoints pass scans.
- Verify that intentionally vulnerable test endpoints (if created) are flagged.
- Document all findings in `docs/vulnerability-report.md`.

---

### Phase 7: Attack Simulation and Monitoring

**Goal:** Build controllable attack simulation tools and a real-time monitoring system that demonstrates the platform's defensive capabilities.

#### [NEW] backend/services/attackSimService.js

- **Brute-Force Simulation:**
  - Generates N login attempts with random passwords against a target account.
  - Configurable: attempt count, delay between attempts, concurrent connections.
  - Logs each attempt and the system's response (allowed, rate-limited, blocked).
  - Records at which attempt the account lockout triggers.

- **Credential Stuffing Simulation:**
  - Uses a configurable list of email/password pairs.
  - Rotates source IPs (simulated via headers for internal testing).
  - Measures how the risk engine responds to distributed credential attacks.

- **JWT Tampering Simulation:**
  - Attempts to use tokens signed with wrong secret.
  - Modifies token payload (changes userId, extends expiry).
  - Submits expired tokens.
  - Replays previously valid but now-blacklisted tokens.
  - Records accept/reject outcome for each test.

- **Replay Attack Simulation:**
  - Captures a valid token and re-submits after logout/blacklist.
  - Tests refresh token reuse detection.
  - Measures detection latency.

#### [NEW] backend/routes/attackSimRoutes.js
- `POST /api/attacks/brute-force` -- authenticated, admin only.
- `POST /api/attacks/credential-stuffing` -- authenticated, admin only.
- `POST /api/attacks/jwt-tamper` -- authenticated, admin only.
- `POST /api/attacks/replay` -- authenticated, admin only.
- `GET /api/attacks/:simId/status` -- real-time simulation status.
- `GET /api/attacks/logs` -- paginated attack event logs.

#### [NEW] backend/services/metricsService.js
- `getBruteForceMetrics()` -- mitigation rate, average attempts before lockout, false positive rate.
- `getRiskEngineMetrics()` -- accuracy, false positive rate, average score distribution.
- `getTokenSecurityMetrics()` -- compromise detection time, rotation success rate.
- `getPerformanceMetrics()` -- response times under attack vs. normal load.
- `getVulnCoverageMetrics()` -- percentage of OWASP Top 10 covered by scanner.

#### Frontend: Attack Simulation Page (referenced in Phase 5)
- Connects to attack sim endpoints.
- Streams real-time logs via polling (or WebSocket upgrade if time permits).
- Displays results in sortable, filterable tables.
- Charts showing defense effectiveness.

#### Verification
- Run each simulation against the live local system.
- Verify brute-force is stopped within configured threshold.
- Verify credential stuffing detection triggers risk escalation.
- Verify all JWT tampering variants are rejected.
- Verify replay attacks are detected and logged.
- Compile metrics into `docs/security-metrics.md`.

---

### Phase 8: Cloud Deployment (AWS)

**Goal:** Deploy the platform to AWS with production-grade security hardening.

#### Infrastructure Setup

- **EC2 Instance:**
  - Amazon Linux 2 or Ubuntu 22.04 LTS.
  - Instance type: t3.medium (minimum).
  - Security group: inbound 443 (HTTPS) only from public; 22 (SSH) from admin IP only.
  - Elastic IP for stable addressing.

- **MongoDB Atlas:**
  - Managed cluster (M10 or free tier for demo).
  - VPC peering or IP whitelist to EC2.
  - Encryption at rest enabled.

- **Redis (ElastiCache):**
  - Single-node Redis cluster in same VPC.
  - Encryption in transit enabled.
  - Auth token configured.

#### Security Hardening

- **HTTPS / TLS:**
  - SSL certificate via AWS Certificate Manager (ACM) or Let's Encrypt.
  - Enforce TLS 1.2+ only.
  - HSTS header with max-age of 1 year.

- **AWS WAF:**
  - Web ACL attached to ALB or CloudFront distribution.
  - Rules: rate-based (2000 requests per 5 minutes per IP), SQL injection rule set, XSS rule set, known bad inputs.
  - Logging to S3 for audit.

- **CloudWatch:**
  - Application log group for backend logs.
  - Custom metrics: login attempts, risk scores, blocked requests.
  - Alarms: spike in 4xx/5xx errors, unusual login volume, high risk scores.
  - Dashboard for operational monitoring.

#### Deployment Process

- **PM2** for Node.js process management (clustering, auto-restart).
- **Nginx** as reverse proxy:
  - SSL termination.
  - Static file serving for React build.
  - Proxy pass to Express on localhost:5000.
  - Security headers injection.
- Frontend: `npm run build` output served as static files by Nginx.
- Environment variables managed via AWS Systems Manager Parameter Store or `.env` file on EC2.

#### [NEW] .github/workflows/ci.yml
- Trigger on push to `main` and pull requests.
- Steps: install dependencies, lint, run tests, build frontend.
- Fail pipeline on any test failure or lint error.

#### [NEW] .github/workflows/deploy.yml
- Trigger on push to `main` (after CI passes).
- Steps: SSH into EC2, pull latest code, install dependencies, run tests, build frontend, restart PM2 processes.
- Health check after deployment.

#### Verification
- Application accessible via HTTPS with valid certificate.
- HTTP requests redirect to HTTPS.
- WAF blocks SQL injection and XSS payloads at the edge.
- CloudWatch alarms fire on test attack simulations.
- Zero downtime deployment verified.

---

## 5. Security Metrics and Evaluation Criteria

After full deployment, the following metrics will be measured and documented:

| Metric | Target | Measurement Method |
|---|---|---|
| Brute-force mitigation rate | >99% of attacks blocked | Run 10,000 attempt simulation, measure block rate |
| Account lockout trigger | Within 5 failed attempts | Brute-force simulation with monitoring |
| Risk engine false positive rate | <5% | Legitimate user login testing across scenarios |
| Token compromise detection time | <1 second | JWT tampering and replay simulations |
| Refresh token reuse detection | 100% detection | Replay simulation with family tracking |
| MFA bypass resistance | 0 bypasses | Replay, brute-force against TOTP |
| SQL injection coverage | 100% of auth endpoints | Scanner module results |
| XSS coverage | 100% of user inputs | Scanner module results |
| CSRF protection coverage | 100% of state-changing endpoints | Scanner module results |
| System response time under attack | <500ms p95 | Load test during attack simulation |
| API uptime during attack | >99.9% | Monitoring during attack simulation |

---

## 6. Estimated Timeline

| Phase | Description | Estimated Duration |
|---|---|---|
| Phase 1 | Project Scaffolding and Configuration | 1-2 days |
| Phase 2 | Zero Trust Authentication Core | 3-4 days |
| Phase 3 | Risk-Based Authentication Engine | 2-3 days |
| Phase 4 | Multi-Factor Authentication | 2-3 days |
| Phase 5 | React Security Dashboard | 4-5 days |
| Phase 6 | Vulnerability Detection System | 2-3 days |
| Phase 7 | Attack Simulation and Monitoring | 2-3 days |
| Phase 8 | Cloud Deployment (AWS) | 2-3 days |
| -- | Testing, Documentation, Polish | 2-3 days |
| **Total** | | **~20-29 days** |

Phases 3 and 4 can be worked in parallel. Phase 5 (frontend) can begin as soon as Phase 2 API endpoints are functional, and then iterate as Phases 3, 4, 6, and 7 deliver new endpoints.

---

## 7. Open Questions

1. **MongoDB hosting:** Will you use MongoDB Atlas (cloud-managed) or run MongoDB locally during development? Atlas is recommended for easier setup and production readiness.

2. **Redis hosting:** Do you have Redis installed locally, or should the plan include Docker setup instructions for local Redis?

3. **AWS account:** Is an AWS account already available for deployment? Are there budget constraints that would affect instance sizing or managed service choices?

4. **Domain name:** Do you have a domain name for the HTTPS certificate, or will the platform be accessed via EC2 IP address?

5. **Team task assignment:** With three team members, would you like the phases assigned to specific people? A natural split might be:
   - Person A: Backend auth core (Phases 2, 3, 4)
   - Person B: Frontend dashboard (Phase 5)
   - Person C: Security scanning, attack sim, deployment (Phases 6, 7, 8)

6. **Scope prioritization:** If time is constrained, which features are highest priority? The core authentication with MFA and the dashboard are likely essential; the vulnerability scanner and attack simulation could be simplified if needed.

/**
 * Application-wide constants
 */

const BCRYPT_SALT_ROUNDS = 12;

const RISK_THRESHOLDS = {
  LOW: 25,       // 0-25: Allow, no additional verification
  MEDIUM: 50,    // 26-50: Require MFA verification
  HIGH: 75,      // 51-75: Require MFA + email confirmation
  CRITICAL: 100, // 76-100: Block login, lock account, alert admin
};

const RATE_LIMITS = {
  REGISTER: { windowMs: 60 * 60 * 1000, max: 5 },       // 5 per hour per IP
  LOGIN: { windowMs: 60 * 1000, max: 10 },              // 10 per minute per IP
  REFRESH: { windowMs: 60 * 60 * 1000, max: 30 },       // 30 per hour
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },      // 100 per 15 min
};

const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  MFA_SETUP: 'MFA_SETUP',
  MFA_VERIFY: 'MFA_VERIFY',
  MFA_FAILURE: 'MFA_FAILURE',
  LOGOUT: 'LOGOUT',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  SESSION_REVOKED: 'SESSION_REVOKED',
};

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

module.exports = {
  BCRYPT_SALT_ROUNDS,
  RISK_THRESHOLDS,
  RATE_LIMITS,
  AUDIT_ACTIONS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
};

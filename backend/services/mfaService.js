const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');
const { env } = require('../config/environment');

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a raw TOTP secret using the `.env` MFA AES-256-GCM symmetric key.
 */
function encryptSecret(secret) {
  const key = Buffer.from(env.MFA_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Stored cleanly as "iv:authTag:ciphertext"
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts the raw TOTP secret back into memory.
 */
function decryptSecret(encryptedString) {
  if (!encryptedString) return null;
  const parts = encryptedString.split(':');
  if (parts.length !== 3) throw new Error('Invalid MFA secret format in database');
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = Buffer.from(env.MFA_ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generates the backend artifacts needed for a user to scan a QR code.
 * The new secret is held in Redis until the user confirms with a valid TOTP,
 * so an existing active MFA secret is never overwritten mid-setup.
 */
async function generateSetupPayload(user) {
  const secret = speakeasy.generateSecret({
    name: `ZeroTrustPlatform (${user.email})`
  });

  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(5).toString('hex'));
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  const hashedCodes = await Promise.all(recoveryCodes.map(code => bcrypt.hash(code, salt)));

  const redisClient = getRedisClient();
  if (!redisClient || redisClient.status !== 'ready') {
    throw new Error('MFA setup is temporarily unavailable');
  }

  // 10-minute window to complete setup
  await redisClient.setex(
    `mfa_pending:${user._id}`,
    600,
    JSON.stringify({ secret: secret.base32, hashedCodes })
  );

  return { qrDataUrl, recoveryCodes, secretValidation: secret.base32 };
}

/**
 * Verifies the TOTP against the pending Redis secret and, on success,
 * atomically commits it to the user document — replacing any prior secret.
 */
async function verifyAndCommitSetup(user, token) {
  const redisClient = getRedisClient();
  if (!redisClient || redisClient.status !== 'ready') {
    throw new Error('MFA setup is temporarily unavailable');
  }

  const raw = await redisClient.get(`mfa_pending:${user._id}`);
  if (!raw) throw new Error('No pending MFA setup found. Please restart setup.');

  const { secret, hashedCodes } = JSON.parse(raw);

  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!isValid) return false;

  user.mfaSecret = encryptSecret(secret);
  user.recoveryCodes = hashedCodes;
  user.mfaEnabled = true;
  await user.save();

  await redisClient.del(`mfa_pending:${user._id}`);
  return true;
}

/**
 * Replay protection using Redis.
 */
async function isReplay(userId, token) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') return false; // Fallback gracefully

    const key = `used_mfa:${userId}:${token}`;
    const exists = await redisClient.get(key);
    if (exists) return true;
    
    await redisClient.setex(key, 90, 'used');
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Checks a 6-digit TOTP against the User's stored AES cipher.
 */
async function verifyTOTP(user, token) {
  if (!user.mfaSecret) return false;
  
  const replayed = await isReplay(user._id.toString(), token);
  if (replayed) throw new Error('Security violation: MFA Token Replay detected.');

  const rawSecret = decryptSecret(user.mfaSecret);
  
  return speakeasy.totp.verify({
    secret: rawSecret,
    encoding: 'base32',
    token: token,
    window: 1 // +/- 30 second drift allowed
  });
}

/**
 * Checks a backup recovery code and burns it.
 */
async function verifyRecoveryCode(user, code) {
  const bcrypt = require('bcryptjs');
  
  for (let i = 0; i < user.recoveryCodes.length; i++) {
    const isMatch = await bcrypt.compare(code, user.recoveryCodes[i]);
    if (isMatch) {
      // Burn code
      user.recoveryCodes.splice(i, 1);
      await user.save();
      return true;
    }
  }
  return false;
}

module.exports = {
  generateSetupPayload,
  verifyAndCommitSetup,
  verifyTOTP,
  verifyRecoveryCode
};

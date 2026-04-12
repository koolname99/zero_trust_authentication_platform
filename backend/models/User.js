const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String, // Encrypted TOTP secret
  },
  recoveryCodes: [{
    type: String, // Hashed recovery codes
  }],
  knownDevices: [{
    fingerprint: String,
    userAgent: String,
    lastSeen: Date,
  }],
  riskProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskProfile',
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
  },
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if locked out
userSchema.methods.isLockedOut = function () {
  return this.lockoutUntil && this.lockoutUntil > new Date();
};

const User = mongoose.model('User', userSchema);
module.exports = User;

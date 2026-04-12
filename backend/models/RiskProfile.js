const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  country: String,
  city: String,
  latitude: Number,
  longitude: Number,
  deviceFingerprint: String,
  outcome: { type: String, enum: ['SUCCESS', 'FAILED', 'CHALLENGED', 'BLOCKED'] },
  riskScore: Number
}, { _id: false });

const riskProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  baselineRiskScore: {
    type: Number,
    default: 0
  },
  loginHistory: [loginHistorySchema],
  knownIPs: [String],
  knownGeoLocations: [String], // Stored as "Country-City" strings to track
  knownDevices: [String],
  anomalyCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Method to add new history cleanly and cap at last 90 recent logins
riskProfileSchema.methods.addLoginHistory = function(historyEntry) {
  this.loginHistory.push(historyEntry);
  if (this.loginHistory.length > 90) {
    this.loginHistory.shift(); // Remove oldest
  }
  this.lastUpdated = Date.now();
};

const RiskProfile = mongoose.model('RiskProfile', riskProfileSchema);
module.exports = RiskProfile;

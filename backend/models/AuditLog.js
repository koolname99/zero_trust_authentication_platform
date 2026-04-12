const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../utils/constants');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  action: {
    type: String,
    enum: Object.values(AUDIT_ACTIONS),
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  riskScore: {
    type: Number,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible object for additional details
  },
  timestamp: {
    type: Date,
    default: Date.now,
    // Optional: add expires: '90d' for 90-day retention policy
  },
});

// Create index for fast querying of recent events
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;

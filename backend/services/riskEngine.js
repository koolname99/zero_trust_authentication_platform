const geoService = require('./geoService');
const RiskProfile = require('../models/RiskProfile');
const User = require('../models/User');
const { riskLogger } = require('../utils/logger');

/**
 * Core mathematical engine to evaluate threat scores based on user telemetry.
 */
async function calculateRiskScore(userId, requestContext) {
  let score = 0;

  // Create or Fetch Profile
  let profile = await RiskProfile.findOne({ userId });
  if (!profile) {
    profile = new RiskProfile({ userId });
    await profile.save();
    // Brand new profiles have an inherent minor risk due to lack of baseline (let's say 10), but we'll grant leniency for now.
  }

  const { ipAddress, userAgent, fingerprint } = requestContext;
  const uid = userId.toString();

  const addRisk = (factor, points) => {
    score += points;
    riskLogger.info(`userId=${uid} factor="${factor}" +${points} -> running_score=${score}`);
  };

  // 1. GEO AND IP EVALUATION
  const location = geoService.getLocation(ipAddress);
  const geoString = `${location.country}-${location.city}`;

  if (!profile.knownGeoLocations.includes(geoString) && location.country !== 'UNKNOWN') {
    addRisk('New Geolocation', 20);
  }

  if (!profile.knownIPs.includes(ipAddress)) {
    addRisk('New IP Address', 15);
  }

  if (geoService.isTorExitNode(ipAddress)) {
    addRisk('Known Anonymizer/Tor', 35);
  }

  // 2. DEVICE EVALUATION
  if (!profile.knownDevices.includes(fingerprint) && fingerprint !== 'unknown') {
    addRisk('New Device', 25);
  }

  // 3. FAILURE STREAK EVALUATION
  const user = await User.findById(userId);
  if (user && user.failedLoginAttempts > 0) {
    const failurePenalty = user.failedLoginAttempts * 10;
    addRisk(`Recent Failed Logins (${user.failedLoginAttempts})`, failurePenalty);
  }

  // 4. IMPOSSIBLE TRAVEL EVALUATION
  // Find the last successful login to compare distance and time
  const lastSuccess = [...profile.loginHistory].reverse().find(h => h.outcome === 'SUCCESS');
  if (lastSuccess && lastSuccess.latitude && location.latitude) {
    const distanceKm = geoService.calculateDistance(lastSuccess, location);
    const hoursSinceLastLogin = (Date.now() - new Date(lastSuccess.timestamp).getTime()) / (1000 * 60 * 60);

    // Assuming max human travel speed via commercial jet is ~900km/h
    if (hoursSinceLastLogin > 0) {
      const requiredSpeed = distanceKm / hoursSinceLastLogin;
      if (requiredSpeed > 900 && distanceKm > 500) {
        addRisk('Impossible Travel', 30);
      }
    }
  }

  // Cap Score
  score = Math.min(score, 100);
  riskLogger.info(`userId=${uid} final_score=${score}`);

  return {
    score,
    profile,
    location,
    geoString
  };
}

module.exports = {
  calculateRiskScore
};

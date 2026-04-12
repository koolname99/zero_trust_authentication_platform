const geoService = require('./geoService');
const RiskProfile = require('../models/RiskProfile');
const User = require('../models/User');

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
  
  // 1. GEO AND IP EVALUATION
  const location = geoService.getLocation(ipAddress);
  const geoString = `${location.country}-${location.city}`;

  if (!profile.knownGeoLocations.includes(geoString) && location.country !== 'UNKNOWN') {
    score += 20; // New Geolocation
  }

  if (!profile.knownIPs.includes(ipAddress)) {
    score += 15; // New IP Address
  }

  if (geoService.isTorExitNode(ipAddress)) {
    score += 35; // Known Anonymizer/Tor
  }

  // 2. DEVICE EVALUATION
  if (!profile.knownDevices.includes(fingerprint) && fingerprint !== 'unknown') {
    score += 25; // New Device
  }

  // 3. FAILURE STREAK EVALUATION
  const user = await User.findById(userId);
  if (user && user.failedLoginAttempts > 0) {
    const failurePenalty = Math.min(user.failedLoginAttempts * 5, 25);
    score += failurePenalty;
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
        score += 30; // Impossible Travel
      }
    }
  }

  // Cap Score
  score = Math.min(score, 100);
  
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

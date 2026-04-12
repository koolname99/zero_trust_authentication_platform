const geoip = require('geoip-lite');

/**
 * Service to resolve IPs and perform geographical heuristics
 */

// Resolves an IP into telemetry context
function getLocation(ip) {
  // Catch standard localhost / dev anomalies
  if (ip === '127.0.0.1' || ip === '::1') {
    return { country: 'US', region: 'Local', city: 'Localhost', latitude: 0, longitude: 0 };
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    return { country: 'UNKNOWN', region: 'UNKNOWN', city: 'UNKNOWN', latitude: null, longitude: null };
  }

  return {
    country: geo.country,
    region: geo.region,
    city: geo.city,
    latitude: geo.ll[0],
    longitude: geo.ll[1]
  };
}

// Determines if velocity exceeds normal bounds. Calculates distance between two coords using Haversine formula (km)
function calculateDistance(loc1, loc2) {
  if (loc1.latitude == null || loc2.latitude == null) return 0;
  
  const toRadian = angle => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);

  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(loc2.latitude, loc1.latitude);
  const dLon = distance(loc2.longitude, loc1.longitude);

  const lat1 = toRadian(loc1.latitude);
  const lat2 = toRadian(loc2.latitude);

  // Haversine Formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    
  const c = 2 * Math.asin(Math.sqrt(a));
  
  return RADIUS_OF_EARTH_IN_KM * c;
}

// Pseudo Tor-Exit node checking (Placeholder for API / Redline logic in prod)
function isTorExitNode(ip) {
  const dummyTorExits = new Set([
    '104.244.72.115', '185.220.101.43', '185.220.101.144'
  ]);
  return dummyTorExits.has(ip);
}

module.exports = {
  getLocation,
  calculateDistance,
  isTorExitNode
};

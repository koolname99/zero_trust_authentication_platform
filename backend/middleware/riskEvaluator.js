const riskEngine = require('../services/riskEngine');
const { RISK_THRESHOLDS } = require('../utils/constants');

/**
 * Utility acting as a barrier/evaluator during the authentication process.
 * Not mapped via app.use() conventionally, but manually invoked inside authService pipelines.
 */
async function evaluateRiskAndEnforce(userId, requestContext) {
  // Compute exactly how risky this connection is
  const { score, profile, location, geoString } = await riskEngine.calculateRiskScore(userId, requestContext);
  
  // Decide what to do based on dynamic risk thresholds
  let responseAction = 'ALLOW';
  
  if (score >= RISK_THRESHOLDS.CRITICAL) {
    // 76-100
    responseAction = 'BLOCK';
  } else if (score >= RISK_THRESHOLDS.HIGH) {
    // 51-75
    responseAction = 'MFA_EMAIL';
  } else if (score >= RISK_THRESHOLDS.MEDIUM) {
    // 26-50
    responseAction = 'MFA';
  }

  return {
    score,
    responseAction,
    profile,
    location,
    geoString
  };
}

module.exports = {
  evaluateRiskAndEnforce
};

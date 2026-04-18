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

  if (score <= RISK_THRESHOLDS.LOW) {
    // 0-25: Allow, no additional verification
    responseAction = 'ALLOW';
  } else if (score <= RISK_THRESHOLDS.MEDIUM) {
    // 26-50: Require MFA verification
    responseAction = 'MFA';
  } else if (score <= RISK_THRESHOLDS.HIGH) {
    // 51-75: Require MFA + email confirmation
    responseAction = 'MFA_EMAIL';
  } else if (score <= RISK_THRESHOLDS.CRITICAL) {
    // 76-100: Block login, lock account, alert admin
    responseAction = 'BLOCK';
  } else {
    // >100: Extreme case, definitely block and alert
    responseAction = 'BLOCK';
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

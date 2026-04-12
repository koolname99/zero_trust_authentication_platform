const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Clean up completion logic using the 'finish' event
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logInfo = `${req.method} ${req.originalUrl} | Status: ${res.statusCode} | IP: ${req.ip} | UserAgent: ${req.headers['user-agent']} | Duration: ${duration}ms`;
    
    if (res.statusCode >= 500) {
      logger.error(logInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(logInfo);
    } else {
      logger.info(logInfo);
    }
  });

  next();
}

module.exports = requestLogger;

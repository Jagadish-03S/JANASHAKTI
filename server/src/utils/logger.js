/**
 * Structured Logger for JANASHAKTI Backend
 */

const formatTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, meta = {}) => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (message, error = null) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`, error ? (error.stack || error) : '');
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  },
};

module.exports = logger;


const rateLimit = require('express-rate-limit');

/**
 * Standard API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this client, please try again after 15 minutes.',
  },
});

/**
 * Sensitive Endpoint Limiter (Auth & Login)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Incident Submission Rate Limiter
 */
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 incident reports per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Incident submission limit reached. Please wait before reporting another incident.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  reportLimiter,
};


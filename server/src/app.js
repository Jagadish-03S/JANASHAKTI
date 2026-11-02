const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Security Headers with Cross-Origin Resource Sharing policy
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration allowing frontend dev & prod
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // In development allow any localhost
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      if (origin === env.CLIENT_URL) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for incident uploads
app.use('/uploads', express.static(env.UPLOADS.DIR));

// General rate limiter for all API routes
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', routes);
app.use('/api/v1', routes);

// Root fallback / sanity ping
app.get('/', (req, res) => {
  res.status(200).json({
    platform: 'JANASHAKTI Civic Safety Platform',
    pilotCity: 'Davanagere, Karnataka',
    apiHealth: '/api/health',
    version: '1.0.0-phase1',
  });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;


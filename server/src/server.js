const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { initDatabase } = require('./config/db');
const { setupSocketIO } = require('./sockets/socketHandler');

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO to Express app for controllers to emit events
app.set('io', io);
setupSocketIO(io);

// Graceful startup
async function startServer() {
  try {
    await initDatabase();

    server.listen(env.PORT, '127.0.0.1', () => {
      logger.info(`=======================================================`);
      logger.info(`JANASHAKTI Backend Service Started Successfully`);
      logger.info(`Pilot Deployment: ${env.PILOT.CITY}, Karnataka, India`);
      logger.info(`Port: ${env.PORT} | Environment: ${env.NODE_ENV}`);
      logger.info(`Health Check: http://localhost:${env.PORT}/api/health`);
      logger.info(`=======================================================`);
    });
  } catch (err) {
    logger.error('Failed to start JANASHAKTI backend service:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

startServer();

module.exports = { app, server, io };


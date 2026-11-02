const logger = require('../utils/logger');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join pilot city or ward-specific room
    socket.on('join:ward', (wardId) => {
      const room = `ward_${wardId}`;
      socket.join(room);
      logger.info(`Client ${socket.id} joined room ${room}`);
    });

    // Authority dashboard joins dedicated command room
    socket.on('join:authority', () => {
      socket.join('authority_command');
      logger.info(`Client ${socket.id} joined authority command room`);
    });

    // Leave room
    socket.on('leave:ward', (wardId) => {
      const room = `ward_${wardId}`;
      socket.leave(room);
      logger.info(`Client ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket client disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = {
  setupSocketIO,
};


const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file exceeds the maximum permitted size limit (5MB).',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle custom file filter errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default server error
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error encountered in JANASHAKTI service.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on JANASHAKTI backend.`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};


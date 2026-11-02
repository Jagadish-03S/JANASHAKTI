const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOADS.DIR)) {
  fs.mkdirSync(env.UPLOADS.DIR, { recursive: true });
}

// Storage configuration with sanitized timestamped filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOADS.DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `dvg_inc_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  },
});

// File filter: only secure image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted for incident reporting.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOADS.MAX_SIZE_MB * 1024 * 1024, // 5MB default
    files: 4, // Max 4 photos per incident
  },
  fileFilter,
});

module.exports = upload;


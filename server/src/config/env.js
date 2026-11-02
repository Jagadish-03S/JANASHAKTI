const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'janashakti_pilot_secret_key_change_in_production_min32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    NAME: process.env.DB_NAME || 'janashakti_db',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
    SSL: process.env.DB_SSL === 'true',
  },
  UPLOADS: {
    DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
    MAX_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  },
  PILOT: {
    CITY: process.env.PILOT_CITY_NAME || 'Davanagere',
    LAT: parseFloat(process.env.PILOT_LATITUDE) || 14.4644,
    LNG: parseFloat(process.env.PILOT_LONGITUDE) || 75.9218,
    JITTER_METERS: parseInt(process.env.PUBLIC_LOCATION_JITTER_METERS, 10) || 100,
  },
};

module.exports = env;


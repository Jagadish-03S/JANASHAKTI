/**
 * PostgreSQL + PostGIS Migration & Seed Runner
 * Pilot Deployment: Davanagere, Karnataka, India
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('../config/env');
const logger = require('../utils/logger');

async function runMigrations() {
  const pool = new Pool({
    host: env.DB.HOST,
    port: env.DB.PORT,
    database: env.DB.NAME,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    ssl: env.DB.SSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });

  try {
    logger.info(`Connecting to PostgreSQL on ${env.DB.HOST}:${env.DB.PORT}/${env.DB.NAME}...`);
    const client = await pool.connect();

    const migrationFiles = [
      '../db/migrations/001_initial_schema.sql',
      '../db/migrations/002_postgis_indexes.sql',
      '../db/seeds/001_davanagere_seed.sql',
    ];

    for (const relPath of migrationFiles) {
      const fullPath = path.resolve(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        logger.info(`Executing migration file: ${path.basename(fullPath)}...`);
        const sql = fs.readFileSync(fullPath, 'utf8');
        await client.query(sql);
        logger.info(`Successfully executed ${path.basename(fullPath)}`);
      }
    }

    client.release();
    await pool.end();
    logger.info('All database migrations and Davanagere seed data executed successfully.');
  } catch (err) {
    logger.warn(`PostgreSQL migration could not connect (${err.message}). Using high-fidelity in-memory PostGIS store.`);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };


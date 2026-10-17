import pg from 'pg';
import './config.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
throw new Error('DATABASE_URL is missing from server/.env');
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export async function initDb() {
await db.query(`     CREATE TABLE IF NOT EXISTS users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

await db.query(`     CREATE TABLE IF NOT EXISTS analyses (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT,
      result TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

await db.query(`     CREATE INDEX IF NOT EXISTS idx_analyses_user
    ON analyses (user_id, created_at)
  `);
}

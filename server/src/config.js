import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  isProd,

  port: Number(process.env.PORT) || 3001,

  jwtSecret: process.env.JWT_SECRET || '',

  geminiKey: process.env.GEMINI_API_KEY || '',

  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',

  dailyLimit: Number(process.env.DAILY_ANALYSES_PER_USER) || 5,
};

if (config.jwtSecret.length < 16) {
  throw new Error(
    'JWT_SECRET must be set in .env and be at least 16 characters.'
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set in server/.env.'
  );
}
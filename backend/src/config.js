import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = (name) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value.trim();
};

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI'),
  dbName: process.env.MONGODB_DB || 'cohesiontech',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  // Comma-separated list of frontend URLs allowed to call the API
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  admin: {
    username: (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase(),
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'Admin'
  },
  // Vercel accepts at most 4.5 MB per request/response, so note files are capped at 4 MB there
  maxNoteFileBytes: (Number(process.env.MAX_NOTE_FILE_MB) || (process.env.VERCEL ? 4 : 25)) * 1024 * 1024
};

if (config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long (use a long random string).');
}

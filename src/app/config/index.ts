import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  database_url: process.env.DATABASE_URL,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET || 'fallback-secret-access',
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'fallback-secret-refresh',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS
    ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
    : 12,
  google_client_id: process.env.GOOGLE_CLIENT_ID || '',
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY || '',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
};

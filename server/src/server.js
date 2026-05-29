import app from './app.js';
import { env } from './config/env.js';
import { db } from './config/db.js';
import { RefreshTokenRepository } from './repositories/refresh-token.repository.js';

const refreshTokenRepo = new RefreshTokenRepository();
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 saat

const purgeExpiredTokens = async () => {
  try {
    const deleted = await refreshTokenRepo.deleteExpired();
    if (deleted) console.log(`Purged ${deleted} expired refresh token(s)`);
  } catch (err) {
    console.error('Failed to purge expired refresh tokens', err);
  }
};

const checkDbConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
};

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  checkDbConnection();
  purgeExpiredTokens();
  // unref(): bu zamanlayıcı sürecin kapanmasını engellemesin
  setInterval(purgeExpiredTokens, CLEANUP_INTERVAL_MS).unref();
});

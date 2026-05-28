import { rateLimit } from 'express-rate-limit';

const rateLimitResponse = (message) => ({
  handler: (_req, res) => res.status(429).json({ error: message }),
});

// Tüm API'ye uygulanan genel limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ...rateLimitResponse('Too many requests, please try again later'),
});

// Brute-force koruması: login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ...rateLimitResponse('Too many login attempts, please try again in 15 minutes'),
});

// Spam koruması: register
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ...rateLimitResponse('Too many accounts created, please try again in 1 hour'),
});

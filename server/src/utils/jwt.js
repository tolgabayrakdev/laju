import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' });

export const verifyToken = (token) =>
  jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '30d' });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwtRefreshSecret, { algorithms: ['HS256'] });

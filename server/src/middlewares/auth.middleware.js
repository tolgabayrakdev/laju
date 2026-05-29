import { verifyToken } from '../utils/jwt.js';
import { HttpException } from '../exceptions/http.exception.js';

export function authenticate(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(new HttpException(401, 'Missing or invalid token'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new HttpException(401, 'Invalid or expired token'));
  }
}

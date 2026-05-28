import { verifyToken } from '../utils/jwt.js';
import { HttpException } from '../exceptions/http.exception.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpException(401, 'Missing or invalid token'));
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new HttpException(401, 'Invalid or expired token'));
  }
}

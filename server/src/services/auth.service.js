import { UserRepository } from '../repositories/user.repository.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { HttpException } from '../exceptions/http.exception.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export class AuthService {
  constructor(repo = new UserRepository(), refreshTokenRepo = new RefreshTokenRepository()) {
    this.repo = repo;
    this.refreshTokenRepo = refreshTokenRepo;
  }

  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new HttpException(400, 'name, email and password are required');
    }

    const existing = await this.repo.findByEmail(email);
    if (existing) throw new HttpException(409, 'Email already in use');

    const hashed = await hashPassword(password);
    const user = await this.repo.create({ name, email, password: hashed });

    return this.#issueTokens(user);
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new HttpException(400, 'email and password are required');
    }

    const user = await this.repo.findByEmail(email);
    if (!user) throw new HttpException(401, 'Invalid credentials');

    const match = await comparePassword(password, user.password);
    if (!match) throw new HttpException(401, 'Invalid credentials');

    return this.#issueTokens(user);
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new HttpException(401, 'Invalid or expired refresh token');
    }

    const stored = await this.refreshTokenRepo.findByToken(refreshToken);
    if (!stored) throw new HttpException(401, 'Refresh token revoked');

    await this.refreshTokenRepo.deleteByToken(refreshToken);

    const user = await this.repo.findById(payload.sub);
    if (!user) throw new HttpException(401, 'User not found');

    return this.#issueTokens(user);
  }

  async logout(refreshToken) {
    await this.refreshTokenRepo.deleteByToken(refreshToken);
  }

  async #issueTokens(user) {
    const accessToken = signToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save(user.id, refreshToken, expiresAt);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: this.#safe(user),
    };
  }

  #safe({ id, name, email, created_at }) {
    return { id, name, email, created_at };
  }
}

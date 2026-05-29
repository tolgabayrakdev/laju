import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { HttpException } from '../exceptions/http.exception.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/email.js';
import { env } from '../config/env.js';

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
    await this.repo.create({ name, email, password: hashed });

    return { message: 'Account created successfully' };
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

    const user = await this.repo.findById(payload.id);
    if (!user) throw new HttpException(401, 'User not found');

    return this.#issueTokens(user);
  }

  async me(userId) {
    const user = await this.repo.findById(userId);
    if (!user) throw new HttpException(404, 'User not found');
    return this.#safe(user);
  }

  async logout(refreshToken) {
    await this.refreshTokenRepo.deleteByToken(refreshToken);
  }

  async forgotPassword(email) {
    const user = await this.repo.findByEmail(email);
    if (!user) return; // enumeration önleme — hata fırlatma

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await this.repo.saveResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  async verifyResetToken(rawToken) {
    if (!rawToken) throw new HttpException(400, 'token is required');

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await this.repo.findByResetToken(tokenHash);

    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      throw new HttpException(400, 'Invalid or expired reset token');
    }
  }

  async resetPassword(rawToken, newPassword) {
    if (!rawToken || !newPassword) {
      throw new HttpException(400, 'token and password are required');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await this.repo.findByResetToken(tokenHash);

    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      throw new HttpException(400, 'Invalid or expired reset token');
    }

    const hashed = await hashPassword(newPassword);
    await this.repo.updatePassword(user.id, hashed);
    await this.repo.clearResetToken(user.id);    
    sendPasswordChangedEmail(user.email);
  }

  async #issueTokens(user) {
    const accessToken = signToken({ id: user.id, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id });
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

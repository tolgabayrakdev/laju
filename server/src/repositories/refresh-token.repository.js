import crypto from 'node:crypto';
import { db } from '../config/db.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export class RefreshTokenRepository {
  constructor() {
    this.table = 'refresh_tokens';
  }

  async save(userId, token, expiresAt) {
    const [row] = await db(this.table)
      .insert({ user_id: userId, token: hashToken(token), expires_at: expiresAt })
      .returning('*');
    return row;
  }

  findByToken(token) {
    return db(this.table).where({ token: hashToken(token) }).first();
  }

  deleteByToken(token) {
    return db(this.table).where({ token: hashToken(token) }).delete();
  }

  deleteByUserId(userId) {
    return db(this.table).where({ user_id: userId }).delete();
  }

  deleteExpired() {
    return db(this.table).where('expires_at', '<', new Date()).delete();
  }
}

import { db } from '../config/db.js';

export class UserRepository {
  constructor() {
    this.table = 'users';
  }

  findByEmail(email) {
    return db(this.table).where({ email }).first();
  }

  findById(id) {
    return db(this.table).where({ id }).first();
  }

  async create(data) {
    const [row] = await db(this.table).insert(data).returning('*');
    return row;
  }

  saveResetToken(id, tokenHash, expiresAt) {
    return db(this.table).where({ id }).update({ reset_token: tokenHash, reset_token_expires: expiresAt });
  }

  findByResetToken(tokenHash) {
    return db(this.table).where({ reset_token: tokenHash }).first();
  }

  async updatePassword(id, hashedPassword) {
    const [row] = await db(this.table).where({ id }).update({ password: hashedPassword }).returning('*');
    return row;
  }

  clearResetToken(id) {
    return db(this.table).where({ id }).update({ reset_token: null, reset_token_expires: null });
  }
}

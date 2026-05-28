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
}

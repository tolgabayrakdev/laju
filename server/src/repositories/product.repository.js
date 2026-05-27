import { db } from '../config/db.js';

export class ProductRepository {
  constructor() {
    this.table = 'products';
  }

  findAll() {
    return db(this.table).select('*').orderBy('id', 'asc');
  }

  findById(id) {
    return db(this.table).where({ id }).first();
  }

  async create(data) {
    const [row] = await db(this.table).insert(data).returning('*');
    return row;
  }

  async update(id, data) {
    const [row] = await db(this.table).where({ id }).update(data).returning('*');
    return row;
  }

  remove(id) {
    return db(this.table).where({ id }).delete();
  }
}

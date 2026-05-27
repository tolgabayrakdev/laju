import { db } from '../config/db.js';

export class ProductRepository {
  constructor() {
    this.table = 'products';
  }

  async findAll() {
    return db(this.table).select('*').orderBy('id', 'asc');
  }

  async findById(id) {
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

  async remove(id) {
    return db(this.table).where({ id }).delete();
  }
}

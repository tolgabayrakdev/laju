import { ProductRepository } from '../repositories/product.repository.js';
import { HttpException } from '../exceptions/http.exception.js';

export class ProductService {
  constructor() {
    this.repo = new ProductRepository();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id) {
    const product = await this.repo.findById(id);
    if (!product) throw new HttpException(404, 'Product not found');
    return product;
  }

  async create(data) {
    const { name, price, stock } = data;
    if (!name || price == null) throw new HttpException(400, 'name and price are required');
    return this.repo.create({ name, price, stock: stock ?? 0 });
  }

  async update(id, data) {
    await this.getById(id);
    const fields = {};
    if (data.name !== undefined) fields.name = data.name;
    if (data.price !== undefined) fields.price = data.price;
    if (data.stock !== undefined) fields.stock = data.stock;
    return this.repo.update(id, fields);
  }

  async remove(id) {
    await this.getById(id);
    return this.repo.remove(id);
  }
}

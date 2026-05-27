import { ProductService } from '../services/product.service.js';

export class ProductController {
  constructor() {
    this.service = new ProductService();
  }

  getAll = async (req, res, next) => {
    try {
      const products = await this.service.getAll();
      res.json(products);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const product = await this.service.getById(Number(req.params.id));
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const product = await this.service.update(Number(req.params.id), req.body);
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req, res, next) => {
    try {
      await this.service.remove(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

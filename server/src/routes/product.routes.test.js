import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { ProductService } from '../services/product.service.js';
import { HttpException } from '../exceptions/http.exception.js';

vi.mock('../services/product.service.js');

describe('Product Routes', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = vi.mocked(ProductService.prototype);
  });

  describe('GET /api/products', () => {
    it('200 ve ürün listesi döner', async () => {
      const products = [{ id: 1, name: 'Kalem', price: 5, stock: 10 }];
      service.getAll.mockResolvedValue(products);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(products);
    });
  });

  describe('GET /api/products/:id', () => {
    it('200 ve ürün döner', async () => {
      const product = { id: 1, name: 'Kalem', price: 5, stock: 10 };
      service.getById.mockResolvedValue(product);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(product);
    });

    it('ürün bulunamazsa 404 döner', async () => {
      service.getById.mockRejectedValue(new HttpException(404, 'Product not found'));

      const res = await request(app).get('/api/products/99');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product not found' });
    });
  });

  describe('POST /api/products', () => {
    it('201 ve oluşturulan ürünü döner', async () => {
      const newProduct = { id: 1, name: 'Kalem', price: 5, stock: 0 };
      service.create.mockResolvedValue(newProduct);

      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Kalem', price: 5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newProduct);
    });

    it('gerekli alan eksikse 400 döner', async () => {
      service.create.mockRejectedValue(new HttpException(400, 'name and price are required'));

      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Kalem' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'name and price are required' });
    });
  });

  describe('PUT /api/products/:id', () => {
    it('200 ve güncellenmiş ürünü döner', async () => {
      const updated = { id: 1, name: 'Kalem', price: 10, stock: 5 };
      service.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/products/1')
        .send({ price: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it('ürün bulunamazsa 404 döner', async () => {
      service.update.mockRejectedValue(new HttpException(404, 'Product not found'));

      const res = await request(app)
        .put('/api/products/99')
        .send({ price: 10 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('204 döner', async () => {
      service.remove.mockResolvedValue();

      const res = await request(app).delete('/api/products/1');

      expect(res.status).toBe(204);
    });

    it('ürün bulunamazsa 404 döner', async () => {
      service.remove.mockRejectedValue(new HttpException(404, 'Product not found'));

      const res = await request(app).delete('/api/products/99');

      expect(res.status).toBe(404);
    });
  });
});

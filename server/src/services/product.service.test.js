import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../services/product.service.js';
import { HttpException } from '../exceptions/http.exception.js';

describe('ProductService', () => {
  let service;
  let repo;

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    service = new ProductService(repo);
  });

  describe('getAll', () => {
    it('tüm ürünleri döner', async () => {
      const products = [{ id: 1, name: 'Kalem', price: 5, stock: 10 }];
      repo.findAll.mockResolvedValue(products);

      const result = await service.getAll();

      expect(result).toEqual(products);
      expect(repo.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('getById', () => {
    it('ürün bulunursa döner', async () => {
      const product = { id: 1, name: 'Kalem', price: 5, stock: 10 };
      repo.findById.mockResolvedValue(product);

      const result = await service.getById(1);

      expect(result).toEqual(product);
      expect(repo.findById).toHaveBeenCalledWith(1);
    });

    it('ürün bulunamazsa 404 fırlatır', async () => {
      repo.findById.mockResolvedValue(undefined);

      await expect(service.getById(99)).rejects.toThrow(HttpException);
      await expect(service.getById(99)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('create', () => {
    it('geçerli data ile ürün oluşturur', async () => {
      const newProduct = { id: 1, name: 'Kalem', price: 5, stock: 0 };
      repo.create.mockResolvedValue(newProduct);

      const result = await service.create({ name: 'Kalem', price: 5 });

      expect(result).toEqual(newProduct);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Kalem', price: 5, stock: 0 });
    });

    it('name eksikse 400 fırlatır', async () => {
      await expect(service.create({ price: 5 })).rejects.toMatchObject({ status: 400 });
    });

    it('price eksikse 400 fırlatır', async () => {
      await expect(service.create({ name: 'Kalem' })).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('update', () => {
    it('var olan ürünü günceller', async () => {
      const existing = { id: 1, name: 'Kalem', price: 5, stock: 10 };
      const updated = { ...existing, price: 10 };
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(1, { price: 10 });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(1, { price: 10 });
    });

    it('ürün bulunamazsa 404 fırlatır', async () => {
      repo.findById.mockResolvedValue(undefined);

      await expect(service.update(99, { price: 10 })).rejects.toMatchObject({ status: 404 });
    });

    it("undefined field'ları göndermez", async () => {
      const existing = { id: 1, name: 'Kalem', price: 5, stock: 10 };
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);

      await service.update(1, { price: 20 });

      expect(repo.update).toHaveBeenCalledWith(1, { price: 20 });
    });
  });

  describe('remove', () => {
    it('var olan ürünü siler', async () => {
      repo.findById.mockResolvedValue({ id: 1 });
      repo.remove.mockResolvedValue(1);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(1);
    });

    it('ürün bulunamazsa 404 fırlatır', async () => {
      repo.findById.mockResolvedValue(undefined);

      await expect(service.remove(99)).rejects.toMatchObject({ status: 404 });
    });
  });
});

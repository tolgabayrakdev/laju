import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { HttpException } from '../exceptions/http.exception.js';

vi.mock('../utils/jwt.js', () => ({
  signToken: vi.fn(() => 'mock_access_token'),
  signRefreshToken: vi.fn(() => 'mock_refresh_token'),
  verifyRefreshToken: vi.fn(),
}));

vi.mock('../utils/password.js', () => ({
  hashPassword: vi.fn(() => 'hashed_password'),
  comparePassword: vi.fn(),
}));

import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

describe('AuthService', () => {
  let service;
  let repo;
  let refreshTokenRepo;

  const mockUser = {
    id: 1,
    name: 'Ali',
    email: 'ali@test.com',
    password: 'hashed_password',
    created_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    repo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    refreshTokenRepo = {
      save: vi.fn(),
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
    };

    service = new AuthService(repo, refreshTokenRepo);
  });

  describe('register', () => {
    it('geçerli data ile kayıt olur, access ve refresh token döner', async () => {
      repo.findByEmail.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(mockUser);
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.register({
        name: 'Ali',
        email: 'ali@test.com',
        password: '123456',
      });

      expect(hashPassword).toHaveBeenCalledWith('123456');
      expect(repo.create).toHaveBeenCalledWith({
        name: 'Ali',
        email: 'ali@test.com',
        password: 'hashed_password',
      });
      expect(result).toMatchObject({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('name eksikse 400 fırlatır', async () => {
      await expect(
        service.register({ email: 'ali@test.com', password: '123456' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('email eksikse 400 fırlatır', async () => {
      await expect(service.register({ name: 'Ali', password: '123456' })).rejects.toMatchObject({
        status: 400,
      });
    });

    it('password eksikse 400 fırlatır', async () => {
      await expect(service.register({ name: 'Ali', email: 'ali@test.com' })).rejects.toMatchObject({
        status: 400,
      });
    });

    it('email zaten varsa 409 fırlatır', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'Ali', email: 'ali@test.com', password: '123456' })
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('login', () => {
    it('doğru bilgilerle giriş yapar, token döner', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.login({ email: 'ali@test.com', password: '123456' });

      expect(comparePassword).toHaveBeenCalledWith('123456', mockUser.password);
      expect(result).toMatchObject({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      });
    });

    it('email eksikse 400 fırlatır', async () => {
      await expect(service.login({ password: '123456' })).rejects.toMatchObject({ status: 400 });
    });

    it('password eksikse 400 fırlatır', async () => {
      await expect(service.login({ email: 'ali@test.com' })).rejects.toMatchObject({ status: 400 });
    });

    it('kullanıcı bulunamazsa 401 fırlatır', async () => {
      repo.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'yok@test.com', password: '123456' })
      ).rejects.toMatchObject({ status: 401 });
    });

    it('şifre yanlışsa 401 fırlatır', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'ali@test.com', password: 'yanlis' })
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('refresh', () => {
    it('geçerli token ile yeni token çifti döner (rotation)', async () => {
      verifyRefreshToken.mockReturnValue({ sub: 1 });
      refreshTokenRepo.findByToken.mockResolvedValue({ token: 'mock_refresh_token', user_id: 1 });
      refreshTokenRepo.deleteByToken.mockResolvedValue(1);
      repo.findById.mockResolvedValue(mockUser);
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.refresh('mock_refresh_token');

      expect(refreshTokenRepo.deleteByToken).toHaveBeenCalledWith('mock_refresh_token');
      expect(result).toMatchObject({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      });
    });

    it('DB de token yoksa 401 fırlatır', async () => {
      verifyRefreshToken.mockReturnValue({ sub: 1 });
      refreshTokenRepo.findByToken.mockResolvedValue(undefined);

      await expect(service.refresh('gecersiz_token')).rejects.toMatchObject({ status: 401 });
    });

    it('JWT geçersizse 401 fırlatır', async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refresh('bozuk_token')).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('logout', () => {
    it('refresh token DB den silinir', async () => {
      refreshTokenRepo.deleteByToken.mockResolvedValue(1);

      await service.logout('mock_refresh_token');

      expect(refreshTokenRepo.deleteByToken).toHaveBeenCalledWith('mock_refresh_token');
    });
  });
});

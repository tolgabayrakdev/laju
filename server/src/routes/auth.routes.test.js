import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { AuthService } from '../services/auth.service.js';
import { HttpException } from '../exceptions/http.exception.js';

vi.mock('../services/auth.service.js');

describe('Auth Routes', () => {
  let service;

  const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    user: { id: 1, name: 'Ali', email: 'ali@test.com' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = vi.mocked(AuthService.prototype);
  });

  describe('POST /api/auth/register', () => {
    it('201 ve token çifti döner', async () => {
      service.register.mockResolvedValue(mockTokens);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Ali', email: 'ali@test.com', password: '123456' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockTokens);
    });

    it('alan eksikse 400 döner', async () => {
      service.register.mockRejectedValue(
        new HttpException(400, 'name, email and password are required')
      );

      const res = await request(app).post('/api/auth/register').send({ email: 'ali@test.com' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'name, email and password are required' });
    });

    it('email zaten kullanımdaysa 409 döner', async () => {
      service.register.mockRejectedValue(new HttpException(409, 'Email already in use'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Ali', email: 'ali@test.com', password: '123456' });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Email already in use' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('200, cookie set edilir ve user döner', async () => {
      service.login.mockResolvedValue(mockTokens);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ali@test.com', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: mockTokens.user });
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('bilgiler yanlışsa 401 döner', async () => {
      service.login.mockRejectedValue(new HttpException(401, 'Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ali@test.com', password: 'yanlis' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('alan eksikse 400 döner', async () => {
      service.login.mockRejectedValue(new HttpException(400, 'email and password are required'));

      const res = await request(app).post('/api/auth/login').send({ email: 'ali@test.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('200, cookie yenilenir ve user döner', async () => {
      service.refresh.mockResolvedValue(mockTokens);

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refresh_token=mock_refresh_token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: mockTokens.user });
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('token geçersizse 401 döner', async () => {
      service.refresh.mockRejectedValue(new HttpException(401, 'Invalid or expired refresh token'));

      const res = await request(app).post('/api/auth/refresh').send({ refresh_token: 'gecersiz' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired refresh token' });
    });

    it('token DB de yoksa 401 döner', async () => {
      service.refresh.mockRejectedValue(new HttpException(401, 'Refresh token revoked'));

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refresh_token: 'iptal_edilmis' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Refresh token revoked' });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('200 ve başarı mesajı döner', async () => {
      service.logout.mockResolvedValue();

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'refresh_token=mock_refresh_token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('GET /api/auth/verify-reset-token', () => {
    it('token geçerliyse 200 döner', async () => {
      service.verifyResetToken.mockResolvedValue();

      const res = await request(app).get('/api/auth/verify-reset-token?token=gecerlitoken');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ valid: true });
    });

    it('token geçersiz veya süresi dolmuşsa 400 döner', async () => {
      service.verifyResetToken.mockRejectedValue(
        new HttpException(400, 'Invalid or expired reset token')
      );

      const res = await request(app).get('/api/auth/verify-reset-token?token=gecersiztoken');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid or expired reset token' });
    });

    it('token parametresi yoksa 400 döner', async () => {
      service.verifyResetToken.mockRejectedValue(
        new HttpException(400, 'token is required')
      );

      const res = await request(app).get('/api/auth/verify-reset-token');

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('email kayıtlı olsa da olmasa da 200 döner', async () => {
      service.forgotPassword.mockResolvedValue();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ali@test.com' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'If that email exists, a reset link has been sent' });
    });

    it('servis hata fırlatırsa 500 döner', async () => {
      service.forgotPassword.mockRejectedValue(new Error('smtp error'));

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ali@test.com' });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('token ve şifre geçerliyse 200 döner', async () => {
      service.resetPassword.mockResolvedValue();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'gecerlitoken', password: 'yenisifre123' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Password updated successfully' });
    });

    it('token geçersiz veya süresi dolmuşsa 400 döner', async () => {
      service.resetPassword.mockRejectedValue(
        new HttpException(400, 'Invalid or expired reset token')
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'gecersiz', password: 'yenisifre123' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid or expired reset token' });
    });

    it('alan eksikse 400 döner', async () => {
      service.resetPassword.mockRejectedValue(
        new HttpException(400, 'token and password are required')
      );

      const res = await request(app).post('/api/auth/reset-password').send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'token and password are required' });
    });
  });
});

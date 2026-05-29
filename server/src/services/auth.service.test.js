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

vi.mock('../utils/email.js', () => ({
  sendPasswordResetEmail: vi.fn(),
  sendPasswordChangedEmail: vi.fn(),
}));

import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/email.js';

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
      saveResetToken: vi.fn(),
      findByResetToken: vi.fn(),
      updatePassword: vi.fn(),
      clearResetToken: vi.fn(),
    };

    refreshTokenRepo = {
      save: vi.fn(),
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
    };

    service = new AuthService(repo, refreshTokenRepo);
  });

  describe('register', () => {
    it('geçerli data ile kayıt olur, başarı mesajı döner', async () => {
      repo.findByEmail.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(mockUser);

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
      expect(result).toEqual({ message: 'Account created successfully' });
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

  describe('forgotPassword', () => {
    it('kayıtlı email için token kaydeder ve email gönderir', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);
      repo.saveResetToken.mockResolvedValue();
      sendPasswordResetEmail.mockResolvedValue();

      await service.forgotPassword('ali@test.com');

      expect(repo.saveResetToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.any(Date)
      );
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.stringContaining('/reset-password?token=')
      );
    });

    it('kayıtsız email için hata fırlatmaz, email göndermez', async () => {
      repo.findByEmail.mockResolvedValue(undefined);

      await expect(service.forgotPassword('yok@test.com')).resolves.toBeUndefined();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyResetToken', () => {
    it('geçerli ve süresi dolmamış token ile resolve eder', async () => {
      repo.findByResetToken.mockResolvedValue({
        ...mockUser,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000),
      });

      await expect(service.verifyResetToken('gecerlitoken')).resolves.toBeUndefined();
    });

    it('token yoksa 400 fırlatır', async () => {
      await expect(service.verifyResetToken(undefined)).rejects.toMatchObject({ status: 400 });
    });

    it('DB de bulunamazsa 400 fırlatır', async () => {
      repo.findByResetToken.mockResolvedValue(undefined);

      await expect(service.verifyResetToken('gecersiz')).rejects.toMatchObject({ status: 400 });
    });

    it('süresi dolmuşsa 400 fırlatır', async () => {
      repo.findByResetToken.mockResolvedValue({
        ...mockUser,
        reset_token_expires: new Date(Date.now() - 1000),
      });

      await expect(service.verifyResetToken('suresi_dolmus')).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('resetPassword', () => {
    it('geçerli token ile şifreyi günceller, token temizler ve bildirim maili gönderir', async () => {
      repo.findByResetToken.mockResolvedValue({
        ...mockUser,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      repo.updatePassword.mockResolvedValue();
      repo.clearResetToken.mockResolvedValue();
      sendPasswordChangedEmail.mockResolvedValue();

      await service.resetPassword('gecerlitoken', 'yenisifre123');

      expect(hashPassword).toHaveBeenCalledWith('yenisifre123');
      expect(repo.updatePassword).toHaveBeenCalledWith(mockUser.id, 'hashed_password');
      expect(repo.clearResetToken).toHaveBeenCalledWith(mockUser.id);
      expect(sendPasswordChangedEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('token veya password eksikse 400 fırlatır', async () => {
      await expect(service.resetPassword(undefined, 'sifre')).rejects.toMatchObject({ status: 400 });
      await expect(service.resetPassword('token', undefined)).rejects.toMatchObject({ status: 400 });
    });

    it('token DB de bulunamazsa 400 fırlatır', async () => {
      repo.findByResetToken.mockResolvedValue(undefined);

      await expect(service.resetPassword('gecersiz', 'yenisifre')).rejects.toMatchObject({ status: 400 });
    });

    it('token süresi dolmuşsa 400 fırlatır', async () => {
      repo.findByResetToken.mockResolvedValue({
        ...mockUser,
        reset_token_expires: new Date(Date.now() - 1000),
      });

      await expect(service.resetPassword('suresi_dolmus', 'yenisifre')).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});

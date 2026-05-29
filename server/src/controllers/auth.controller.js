import { AuthService } from '../services/auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
};

export class AuthController {
  constructor(service = new AuthService()) {
    this.service = service;
  }

  #setTokenCookies(res, { access_token, refresh_token }) {
    res.cookie('access_token', access_token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refresh_token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }

  register = async (req, res, next) => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.service.login(req.body);
      this.#setTokenCookies(res, result);
      res.json({ user: result.user });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.service.refresh(req.cookies?.refresh_token);
      this.#setTokenCookies(res, result);
      res.json({ user: result.user });
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.service.me(req.user.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.service.logout(req.cookies?.refresh_token);
      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };

  verifyResetToken = async (req, res, next) => {
    try {
      await this.service.verifyResetToken(req.query?.token);
      res.json({ valid: true });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await this.service.forgotPassword(req.body?.email);
      res.json({ message: 'If that email exists, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      await this.service.resetPassword(req.body?.token, req.body?.password);
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  };
}

import { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(service = new AuthService()) {
    this.service = service;
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
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.service.refresh(req.body.refresh_token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      await this.service.logout(req.body.refresh_token);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

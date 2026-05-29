import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { loginLimiter, registerLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const ctrl = new AuthController();

router.get('/me', authenticate, ctrl.me);
router.post('/register', registerLimiter, ctrl.register);
router.post('/login', loginLimiter, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

export default router;

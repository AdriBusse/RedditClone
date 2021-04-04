import trim from '../middleware/trim';
import auth from '../middleware/auth';
import user from '../middleware/user';
import AuthController from './controller/auth.controller';
import { Router } from 'express';

const router = Router();

const authController = new AuthController();
router.post('/register', trim, authController.register);
router.post('/login', trim, authController.login);
router.get('/me', trim, user, auth, authController.me);
router.post('/logout', trim, user, auth, authController.logout);

export default router;

import { Router } from 'express';
import user from '../middleware/user';
import UserController from './controller/user.controller';

const router = Router();
const userController = new UserController();
router.get('/:username', user, userController.getUserSubmissions);

export default router;

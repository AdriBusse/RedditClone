import { Request, Response, Router } from 'express';
import { getConnection } from 'typeorm';
import Comment from '../entities/Comment';
import { Post } from '../entities/Post';
import { Sub } from '../entities/Sub';
import User from '../entities/User';
import Vote from '../entities/Vote';
import auth from '../middleware/auth';
import user from '../middleware/user';
import MiscController from './controller/misc.controller';
const router = Router();

const miscController = new MiscController();
router.post('/vote', user, auth, miscController.vote);
router.get('/top-subs', miscController.topSubs);

export default router;

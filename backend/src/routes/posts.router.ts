import { Router } from 'express';
import auth from '../middleware/auth';
import userMid from '../middleware/user';
import { PostController } from './controller/post.controller';

const router = Router();
const postController = new PostController();
router.post('/', userMid, auth, postController.createPost);
router.get('/', userMid, postController.getPosts);
router.get('/:identifier/:slug', userMid, postController.getPost);
router.post(
  '/:identifier/:slug/comments',
  userMid,
  auth,
  postController.commentOnPost
);
router.get(
  '/:identifier/:slug/comments',
  userMid,
  postController.getPostComments
);

export default router;

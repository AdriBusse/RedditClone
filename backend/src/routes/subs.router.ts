import { Router } from 'express';
import auth from '../middleware/auth';
import user from '../middleware/user';
import { SubsController } from './controller/subs.controller';

const router = Router();
const subsController = new SubsController();
router.post('/', user, auth, subsController.createSub);
router.get('/:name', user, subsController.getSub);
router.get('/search/:name', subsController.searchSubs);
router.post(
  '/:name/image',
  user,
  auth,
  subsController.ownSub,
  subsController.upload.single('file'),
  subsController.uploadSubImage
);

export default router;

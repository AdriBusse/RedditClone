import { isEmpty } from 'class-validator';
import { NextFunction, Request, Response, Router } from 'express';
import { FileLogger, getRepository } from 'typeorm';
import { Post } from '../entities/Post';
import { Sub } from '../entities/Sub';
import User from '../entities/User';
import auth from '../middleware/auth';
import user from '../middleware/user';
import multer from 'multer';
import { makeId } from '../utils/helpers';
import path from 'path';
import fs from 'fs';

const createSub = async (req: Request, res: Response) => {
  const { name, title, describtion } = req.body;

  const user: User = res.locals.user;

  try {
    let errors: any = {};

    if (isEmpty(name)) errors.name = 'Name must not be empty';
    if (isEmpty(title)) errors.title = 'Title must not be empty';

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.sub = 'Sub already exists';

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (error) {
    return res.status(400).json(error);
  }
  try {
    const sub = new Sub({ name, describtion, title, user });
    await sub.save();

    res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes'],
    });
    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.send(sub);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: 'Sub not found' });
  }
};
const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: 'You dont own the sub' });
    }

    res.locals.sub = sub;
    return next();
  } catch (error) {
    res.status(500).json({ error: 'sth went wrong' });
  }
};
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: (req, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); //e.g udsfhj2jwkascj + .png
    },
  }),
  fileFilter: (req: Request, file: any, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('Not an image'));
    }
  },
});
const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    console.log(req.file);

    const type = req.body.type;
    if (type !== 'image' && type !== 'banner') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid type' });
    }

    let oldImageUrn: string = '';
    const urn = req.file.filename;
    if (type === 'image') {
      oldImageUrn = sub.imageUrn || '';
      sub.imageUrn = urn;
    } else if (type === 'banner') {
      oldImageUrn = sub.bannerUrn || '';
      sub.bannerUrn = urn;
    }

    await sub.save();

    //delete old picture
    if (oldImageUrn !== '') {
      fs.unlinkSync(`public\\images\\${oldImageUrn}`);
    }
    return res.json(sub);
  } catch (error) {
    return res.status(500).json({ error: 'something went wrong' });
  }
};

const searchSubs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;

    if (isEmpty(name)) {
      return res.status(400).json({ error: 'Name must not be Empty' });
    }

    const subs = await getRepository(Sub)
      .createQueryBuilder()
      .where('LOWER(name) LIKE :name', {
        name: `%${name.toLowerCase().trim()}%`,
      }) //%% for find sth which include string
      .getMany();

    return res.json(subs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
const router = Router();

router.post('/', user, auth, createSub);
router.get('/:name', user, getSub);
router.get('/search/:name', searchSubs);
router.post(
  '/:name/image',
  user,
  auth,
  ownSub,
  upload.single('file'),
  uploadSubImage
);

export default router;

import { Request, Response } from 'express';
import Comment from '../../entities/Comment';
import { Sub } from '../../entities/Sub';
import { Post } from '../../entities/Post';

export class PostController {
  createPost = async (req: Request, res: Response) => {
    const { title, body, sub } = req.body;

    const user = res.locals.user;

    if (title.trim() === '') {
      return res.status(400).json({ title: 'Title must not be empty' });
    }

    try {
      const subRecord = await Sub.findOneOrFail({ name: sub });
      const post = new Post({ title, body, user, sub: subRecord });
      await post.save();

      return res.json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'sth went wrong' });
    }
  };

  getPosts = async (req: Request, res: Response) => {
    const currentPage: number = (req.query.page || 0) as number;
    const postsPerPage: number = (req.query.count || 8) as number;
    try {
      const posts = await Post.find({
        order: { createdAt: 'DESC' },
        relations: ['comments', 'votes', 'sub'],
        skip: currentPage * postsPerPage,
        take: postsPerPage,
      });

      if (res.locals.user) {
        posts.forEach((p) => p.setUserVote(res.locals.user));
      }

      return res.json(posts);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };

  getPost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    try {
      const post = await Post.findOneOrFail(
        { identifier, slug },
        { relations: ['sub', 'comments', 'votes'] }
      );

      if (res.locals.user) {
        post.setUserVote(res.locals.user);
      }

      return res.json(post);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ error: 'Post not found' });
    }
  };

  commentOnPost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    const body = req.body.body;
    try {
      const post = await Post.findOneOrFail({ identifier, slug });
      console.log(`find`);

      const comment = new Comment({ body, user: res.locals.user, post });

      await comment.save();

      return res.json(comment);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ error: 'Post not found' });
    }
  };
  getPostComments = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;

    try {
      const post = await Post.findOneOrFail({ identifier, slug });

      const comments = await Comment.find({
        where: { post },
        order: { createdAt: 'DESC' },
        relations: ['votes'],
      });

      if (res.locals.user) {
        comments.forEach((c) => c.setUserVote(res.locals.user));
      }

      return res.json(comments);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };
}

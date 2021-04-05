import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import Comment from '../../entities/Comment';
import { Sub } from '../../entities/Sub';
import { Post } from '../../entities/Post';
import User from '../../entities/User';
import Vote from '../../entities/Vote';

export class MiscController {
  vote = async (req: Request, res: Response) => {
    const { identifier, slug, commentIdentifier, value } = req.body;

    //Validate
    if (![-1, 0, 1].includes(value)) {
      return res.status(400).json({ value: 'value must be -1, 0, 1' });
    }

    try {
      const user: User = res.locals.user;
      let post = await Post.findOneOrFail({ identifier, slug });

      let vote: Vote | undefined;
      let comment: Comment | undefined;

      if (commentIdentifier) {
        comment = await Comment.findOneOrFail({
          identifier: commentIdentifier,
        });
        vote = await Vote.findOne({ user, comment });
      } else {
        vote = await Vote.findOne({ user, post });
      }

      if (!vote && value === 0) {
        //if no vote and value= 0 return error
        return res.status(404).json({ error: 'Vote not found' });
      } else if (!vote) {
        //es wurde noch nicht abgestimmt für den Post/Kommentar
        vote = new Vote({ user, value });
        if (comment) vote.comment = comment;
        else vote.post = post;
        await vote.save();
      } else if (value === 0) {
        //if vote exist and value is 0 remove vote from Db
        await vote.remove();
      } else if (vote.value !== value) {
        //if vote exist already and value is different, update it
        vote.value = value;
        await vote.save();
      }

      post = await Post.findOneOrFail(
        { identifier, slug },
        { relations: ['comments', 'comments.votes', 'sub', 'votes'] }
      );
      post.setUserVote(user);
      post.comments.forEach((c) => c.setUserVote(user));

      return res.json(post);
    } catch (err) {
      console.log(err);

      return res.status(500).json({ error: 'Something went wrong' });
    }
  };

  topSubs = async (req: Request, res: Response) => {
    try {
      const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn",'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;
      //fetch Subs with top posts
      const subs = await getConnection()
        .createQueryBuilder()
        .select(
          `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
        )
        .from(Sub, 's')
        .leftJoin(Post, 'p', `s.name = p."subName"`)
        .groupBy('s.title, s.name,"imageUrl"')
        .orderBy(`"postCount"`, 'DESC')
        .limit(5)
        .execute();

      return res.json(subs);
    } catch (error) {
      return res.status(500).json({ error: 'something went wrong' });
    }
  };
}

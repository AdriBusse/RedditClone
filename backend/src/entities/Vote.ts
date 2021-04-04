import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import BaseEntity from './Entity';
import { Post } from './Post';
import User from './User';
import Comment from './Comment';
import { Exclude } from 'class-transformer';

@Entity({ name: 'Votes' })
export default class Vote extends BaseEntity {
  constructor(vote: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @Column()
  username: string;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Comment)
  comment: Comment;
}

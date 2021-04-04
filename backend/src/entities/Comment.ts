import { IsEmail, Length } from 'class-validator';
import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import BaseEntity from './Entity';
import User from './User';
import { makeId, slugify } from '../utils/helpers';
import { Sub } from './Sub';
import { Post } from './Post';
import Vote from './Vote';

@Entity({ name: 'Comments' })
export default class Comment extends BaseEntity {
  constructor(comment: Partial<Comment>) {
    super();
    Object.assign(this, comment);
  }

  @Index()
  @Column()
  identifier: string; //7 char ID

  @Column()
  body: string;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post: Post;

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.comment)
  votes: Vote[];

  protected userVote: number;
  setUserVote(user: User) {
    //? behind votes
    if (this.votes != undefined) {
      const index = this.votes.findIndex((v) => v.username === user.username);
      this.userVote = index > -1 ? this.votes[index].value : 0;
    } else {
      return 0;
    }
  }

  @Expose() get voteScore(): number {
    if (this.votes != undefined) {
      return this.votes.reduce((prev, curr) => prev + (curr.value || 0), 0);
    } else {
      return 0;
    }
  }

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
}

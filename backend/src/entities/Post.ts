import { IsEmail, Length } from 'class-validator';
import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import BaseEntity from './Entity';
import User from './User';
import { makeId, slugify } from '../utils/helpers';
import { Sub } from './Sub';
import Comment from './Comment';
import Vote from './Vote';
import { Exclude, Expose } from 'class-transformer';

@Entity({ name: 'Posts' })
export class Post extends BaseEntity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @Index()
  @Column()
  identifier: string; //7 char ID

  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column()
  subName: string;

  @Column()
  username: string; //by default join column is not include to the response
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
  sub: Sub;

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post, { nullable: true })
  comments: Comment[];

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  protected userVote: number;
  setUserVote(user: User) {
    if (this.votes != undefined) {
      const index = this.votes.findIndex((v) => v.username === user.username);
      this.userVote = index > -1 ? this.votes[index].value : 0;
    } else {
      this.userVote = 0;
    }
  }
  protected url: string;
  @AfterLoad()
  createFields() {
    this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`;
  }

  //virtuell field. Not in DB (Same like url field)
  @Expose() get commentCount(): number {
    if (this.comments != undefined) {
      return this.comments.length;
    } else {
      return 0;
    }
  }
  //? behind votes and comments
  @Expose() get voteScore(): number {
    if (this.votes != undefined) {
      return this.votes.reduce((prev, curr) => prev + (curr.value || 0), 0);
    } else {
      return 0;
    }
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}

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
import BaseEntity from './Entity';
import User from './User';
import { Post } from './Post';
import { Expose } from 'class-transformer';

@Entity({ name: 'Subs' })
export class Sub extends BaseEntity {
  constructor(sub: Partial<Sub>) {
    super();
    Object.assign(this, sub);
  }

  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  describtion: string;

  @Column({ nullable: true })
  imageUrn: string;

  @Column({ nullable: true })
  bannerUrn: string;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @OneToMany(() => Post, (post) => post.sub)
  posts: Post[];

  //virual field. Not in db
  @Expose()
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : 'data:image/png;base64,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';
  }
  //virual field. Not in db
  @Expose()
  get bannerUrl(): string | undefined {
    return this.bannerUrn
      ? `${process.env.APP_URL}/images/${this.bannerUrn}`
      : undefined;
  }
}

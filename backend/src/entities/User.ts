import { IsEmail, Length } from 'class-validator';
import { Entity, Column, Index, BeforeInsert, OneToMany } from 'typeorm';
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import BaseEntity from './Entity';
import { Post } from './Post';
import Vote from './Vote';

@Entity({ name: 'Users' })
export default class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Column({ unique: true })
  @IsEmail(undefined, { message: 'Must be a valid email address' })
  @Length(1, 255, { message: 'Email is empty' })
  email: string;

  @Index() //Improve Performance
  @Column({ unique: true })
  @Length(3, 255, { message: 'Must be at least 3 characters long' })
  username: string;

  @Column()
  @Length(6, 255, { message: 'Must be at least 6 characters long' })
  @Exclude()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hastPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}

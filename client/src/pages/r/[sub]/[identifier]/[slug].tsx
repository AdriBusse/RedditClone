import { route } from 'next/dist/next-server/server/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import useSWR from 'swr';
import { Post, Comment } from '../../../../types';
import Sidebar from '../../../../components/Sidebar';
import axios from 'axios';
import dayjs from 'dayjs';
import classNames from 'classNames';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuthState } from '../../../../context/auth';
import ActionButton from '../../../../components/ActionButton';
dayjs.extend(relativeTime);

export default function PostPage() {
  //localState
  const [newComment, setNewComment] = useState('');
  //globalState
  const { authenticated, user } = useAuthState();
  //utils
  const router = useRouter();
  const { identifier, sub, slug } = router.query;

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  ); //in the beginning the vars are null, so just fetch if it is assign

  const { data: comments, revalidate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
  ); //in the beginning the vars are null, so just fetch if it is assign
  if (error) router.push('/');

  const vote = async (value: number, comment?: Comment) => {
    if (!authenticated) router.push('/login');

    //If vote is the same then reset it
    if (
      (!comment && value === post.userVote) ||
      (comment && comment.userVote === value)
    )
      value = 0;
    try {
      const res = await axios.post('/misc/vote', {
        identifier: post.identifier,
        slug: post.slug,
        value,
        commentIdentifier: comment?.identifier, //if it is undefined it will not send
      });
      //revalidate
    } catch (error) {
      console.log(error);
    }
  };
  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (newComment.trim() === '') return;

    try {
      await axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
        body: newComment,
      });
      setNewComment('');
      revalidate();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <Head>
        <title>{post?.title}</title>
      </Head>
      <Link href={`/r/${sub}`}>
        <a>
          <div className="flex items-center w-full h-20 p-8 bg-blue-500">
            <div className="container flex">
              {post && (
                <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
                  <Image
                    src={post.sub.imageUrl}
                    height={(8 * 16) / 2}
                    width={(8 * 16) / 2}
                  ></Image>
                </div>
              )}
              <p className="text-xl font-semibold text-white">/r/{sub}</p>
            </div>
          </div>
        </a>
      </Link>
      <div className="container flex pt-5">
        {/**Post */}
        <div className="w-160">
          <div className="bg-white rounded">
            {post && (
              <>
                <div className="flex">
                  {/**Vote Section */}
                  <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                    {/* {UpVote} */}
                    <div
                      onClick={() => vote(1)}
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    >
                      <i
                        className={classNames('icon-arrow-up', {
                          'text-red-500': post.userVote === 1,
                        })}
                      ></i>
                    </div>
                    <p className="text-xs font-bold">{post.voteScore}</p>
                    {/* {DownVote} */}
                    <div
                      onClick={() => vote(-1)}
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
                    >
                      <i
                        className={classNames('icon-arrow-down', {
                          'text-blue-600': post.userVote === -1,
                        })}
                      ></i>
                    </div>
                  </div>
                  <div className="py-2 pr-2">
                    <div className="flex items-center">
                      <p className="text-xs text-gray-600">
                        Posted by
                        <Link href={`/u/${post.username}`}>
                          <a className="mx-1 hover:underline">{`/u/${post.username}`}</a>
                        </Link>
                        <Link href={post.url}>
                          <a className="mx-1 hover:underline">
                            {dayjs(post.createdAt).fromNow()}
                          </a>
                        </Link>
                      </p>
                    </div>
                    <h1 className="my-1 text-xl font-medium">{post.title}</h1>
                    <p className="my-3 text-sm">{post.body}</p>
                    {/**Actions */}
                    <div className="flex">
                      <Link href={post.url}>
                        <a>
                          <ActionButton>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span className="font-bold">
                              {post.commentCount} Comments
                            </span>
                          </ActionButton>
                        </a>
                      </Link>
                      <ActionButton>
                        <i className="mr-1 fas fa-share fa-xs"></i>
                        <span className="font-bold">Share</span>
                      </ActionButton>
                      <ActionButton>
                        <i className="mr-1 fas fa-bookmark fa-xs"></i>
                        <span className="font-bold">Save</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>
                <hr />
                {/**Comments Feed */}
                {/**Comments Input field */}
                <div className="pl-10 pr-6 mb-4">
                  {authenticated ? (
                    <div>
                      <p className="mb-1 text-xs">
                        Comment as{' '}
                        <Link href={`/u/${user.username}`}>
                          <a className="font-semibold text-blue-500">
                            {user.username}
                          </a>
                        </Link>
                      </p>
                      <form onSubmit={submitComment}>
                        <textarea
                          value={newComment}
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gry-600"
                          onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            disabled={newComment.trim() === ''}
                            className="px-3 py-1 mb-1 blue button"
                          >
                            Comment
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-2 py-4 border border-gray-300 rounded">
                      <p className="font-semibold text-gray-500">
                        LogIn or SignUp to leave a Comment
                      </p>
                      <Link href="/login">
                        <a className="px-4 py-1 mr-4 hollow blue button">
                          Login
                        </a>
                      </Link>
                      <Link href="/register">
                        <a className="px-4 py-1 blue button">SignUp</a>
                      </Link>
                    </div>
                  )}
                </div>
                {comments?.map((comment) => (
                  <div className="flex" key={comment.identifier}>
                    {/**Vote Section */}
                    <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                      {/* {UpVote} */}
                      <div
                        onClick={() => vote(1, comment)}
                        className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                      >
                        <i
                          className={classNames('icon-arrow-up', {
                            'text-red-500': comment.userVote === 1,
                          })}
                        ></i>
                      </div>
                      <p className="text-xs font-bold">{comment.voteScore}</p>
                      {/* {DownVote} */}
                      <div
                        onClick={() => vote(-1, comment)}
                        className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
                      >
                        <i
                          className={classNames('icon-arrow-down', {
                            'text-blue-600': comment.userVote === -1,
                          })}
                        ></i>
                      </div>
                    </div>
                    <div className="py-2 pr-2">
                      <p className="leading-none mb-1-text-xs">
                        <Link href={`/u/${comment.username}`}>
                          <a href="" className="mr-1 font-bold hover:underline">
                            {comment.username}
                          </a>
                        </Link>
                        <span className="text-gray-600">{` ${
                          comment.voteScore
                        } points • ${dayjs(
                          comment.createdAt
                        ).fromNow()}`}</span>
                      </p>
                      <p>{comment.body}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {/**Sidebar */}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </div>
  );
}

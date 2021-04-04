import axios from 'axios';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import useSWR from 'swr';
import Sidebar from '../../../components/Sidebar';
import { Post, Sub } from '../../../types';

export default function submit() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const router = useRouter();
  const { sub: subName } = router.query;
  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);
  if (error) router.push('/');

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();

    if (title.trim() === '') return;

    try {
      const { data: post } = await axios.post<Post>('/posts', {
        title: title.trim(),
        body,
        sub: subName,
      }); //if body undefined it will not included
      router.push(`/r/${sub.name}/${post.identifier}/${post.slug}`);
    } catch (error) {}
  };
  return (
    <div className="container flex pt-5">
      <Head>
        <title>Submit to Readit</title>
      </Head>
      <div className="w-160">
        <div className="p-4 bg-white rounded">
          <h1 className="mb-3 text-lg">Submit a post to {subName}</h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                maxLength={300}
                placeholder="Title"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
              />
              <div
                className="absolute mb-2 text-sm text-gray-500 select-none"
                style={{ top: '11px', right: '10px' }}
              >
                {/**length of input eg: 3/300 */}
                {title.trim().length}/300
              </div>
            </div>

            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
              value={body}
              placeholder="Text (optional)"
              rows={4}
              onChange={(e) => setBody(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="px-3 py-1 blue button"
                type="submit"
                disabled={title.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {sub && <Sidebar sub={sub} />}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) throw new Error('Missing Auth Token Cookie');

    await axios.get('/auth/me', { headers: { cookie } });

    return { props: {} };
  } catch (error) {
    // @ts-ignore
    res.writeHead(307, { Location: '/login' }).end();
  }
};

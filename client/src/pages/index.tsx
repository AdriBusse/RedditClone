import axios from 'axios';
import Head from 'next/head';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PostCard from '../components/PostCard';
import Image from 'next/image';
import useSWR, { useSWRInfinite } from 'swr';
import { Post, Sub } from '../types';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthState } from '../context/auth';

dayjs.extend(relativeTime);

export default function Home() {
  //const [posts, setPosts] = useState<Post[]>([]);
  const { data: topSubs } = useSWR<Sub[]>('/misc/top-subs');
  //const { data: posts } = useSWR<Post[]>('/posts');
  const [observedPost, setObservedPost] = useState('');
  const { authenticated, user } = useAuthState();

  const describtion =
    'Reddit is a network of communities based on peoples interesst. Find communities you are interessted in, and become part of an online community';
  const title = 'Frontpage of the Internet';
  const {
    data,
    error,
    mutate,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`);
  const posts: Post[] = data ? [].concat(...data) : [];
  const isInitialLoading = !data && !error;

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const id = posts[posts.length - 1].identifier;
    if (id != observedPost) {
      setObservedPost(id);
      observedElement(document.getElementById(id));
    }
  }, [posts]);

  const observedElement = (element: HTMLElement) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log('reached bottom of post');
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };
  // useEffect(() => {
  //   axios
  //     .get('/posts')
  //     .then((res) => setPosts(res.data))
  //     .catch((err) => console.log(err));
  // }, []);
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="describtion" content={describtion}></meta>
        <meta property="og:describtion" content={describtion}></meta>
        <meta property="og:title" content={title}></meta>
        <meta property="twitter:title" content={title}></meta>
        <meta property="twitter:describtion" content={describtion}></meta>
      </Head>
      <div className="container flex justify-center pt-4">
        <div className="w-full md:w-160">
          {isInitialLoading && (
            <p className="text-lg text-venter">Loading...</p>
          )}
          {posts?.map((post) => (
            <PostCard
              post={post}
              key={post.identifier}
              revalidate={revalidate}
            ></PostCard>
          ))}
          {isValidating && posts.length > 0 && (
            <p className="text-lg text-venter">Loading more Posts...</p>
          )}
        </div>
        {/**Sidebar */}
        <div className="hidden ml-6 w-80 lg:block">
          <div className="bg-white rounded">
            <div className="p-4 border-b-2">
              <p className="text-lg font-semibold text-center">
                Top Communities
              </p>
            </div>
            <div>
              {topSubs?.map((sub: Sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs border-b"
                >
                  <Link href={`/r/${sub.name}`}>
                    <a className=" hover:cursor-pointer">
                      <Image
                        className="overflow-hidden rounded-full "
                        src={sub.imageUrl}
                        alt="Sub"
                        width={(7 * 16) / 4}
                        height={(7 * 16) / 4}
                      />
                    </a>
                  </Link>

                  <Link href={`/r/${sub.name}`}>
                    <a className="ml-1 font-bold hover:cursor-pointer">
                      /r/{sub.name}
                    </a>
                  </Link>
                  <p className="ml-auto font-med">{sub.postCount}</p>
                </div>
              ))}
            </div>
            {authenticated && (
              <div className="p-4 border-t-2">
                <Link href="/subs/create">
                  <a href="" className="w-full px-1 py-1 blue button">
                    Create Comunity
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// serverside rendering. useEffect is clientside rendering
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     //on server so no localhost needed
//     const res = await axios.get('/posts');

//     return { props: { posts: res.data } };
//   } catch (error) {
//     return { props: { error: 'Something went wrong' } };
//   }
// };

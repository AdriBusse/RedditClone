import Head from 'next/head';
import { useRouter } from 'next/router';
import React, {
  Fragment,
  createRef,
  useState,
  useEffect,
  ChangeEvent,
} from 'react';
import useSWR from 'swr';
import PostCard from '../../components/PostCard';
import { Sub } from '../../types';
import Image from 'next/image';
import { useAuthState } from '../../context/auth';
import classNames from 'classNames';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

export default function SubPage() {
  //localState
  const [ownSub, setOwnSub] = useState(false);
  //GlobalState
  const { authenticated, user } = useAuthState();
  //utils
  const router = useRouter();
  const fileInputRef = createRef<HTMLInputElement>();
  const subName = router.query.sub;
  const { data: sub, error, revalidate } = useSWR<Sub>(
    subName ? `/subs/${subName}` : null
  ); // just fetch if subName is defined
  useEffect(() => {
    if (!sub) return;
    setOwnSub(authenticated && user.username === sub.username);
  }, [sub]);
  if (error) router.push('/');
  const openFileInput = async (type: string) => {
    if (!ownSub) return;
    fileInputRef.current.name = type;

    fileInputRef.current.click();
  };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileInputRef.current.name);

    try {
      const res = await axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      //swr refetch
      revalidate();
    } catch (error) {
      console.log(error);
    }
  };
  let postsMarkup;
  if (!sub) {
    postsMarkup = <p className="text-lg text-center">Loading...</p>;
  } else if (sub.posts.length === 0) {
    postsMarkup = (
      <p className="text-lg text-center">
        No posts Submitted to this channel...
      </p>
    );
  } else {
    postsMarkup = sub.posts.map((post) => (
      <PostCard
        key={post.identifier}
        post={post}
        revalidate={revalidate}
      ></PostCard>
    ));
  }
  return (
    <div>
      <div>
        <Head>
          <title>{sub?.title}</title>
        </Head>
      </div>

      {sub && (
        <Fragment>
          <input
            type="file"
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          {/*Subinfo and images */}
          <div>
            {/**Banner Image */}
            <div
              className={classNames('bg-blue-500', {
                'cursor-pointer': ownSub,
              })}
              onClick={() => openFileInput('banner')}
            >
              {sub.bannerUrl ? (
                <div
                  className="h-56 bg-blue-500"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
              ) : (
                <div className="h-20 bg-blue-500"></div>
              )}
            </div>
            {/**Sub MetaData */}
            <div className="h-20 bg-white">
              <div className="container flex pt-1">
                <Image
                  src={sub.imageUrl}
                  alt="Sub"
                  className={classNames('rounded-full ', {
                    'cursor-pointer': ownSub,
                  })}
                  height={70}
                  width={70}
                  onClick={() => openFileInput('image')}
                />

                <div className="pt-1 pl-24">
                  <div className="flex items-center">
                    <h1 className="mb-1 text-3xl font-bold">{sub.title}</h1>
                  </div>
                  <p className="text-sm font-bold text-gray-500">
                    /r/{sub.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/*Posts and sidebar */}

          <div className="container flex justify-center pt-5">
            <div className="w-160">{postsMarkup}</div>
            <Sidebar sub={sub} />
          </div>
        </Fragment>
      )}
    </div>
  );
}

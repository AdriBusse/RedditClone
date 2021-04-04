import RedditLogo from '../../public/reddit.svg';
import Link from 'next/link';
import { useAuthDispatch, useAuthState } from '../context/auth';
import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Sub } from '../types';
import Image from 'next/image';
import router from 'next/router';

export const Navbar: React.FC = () => {
  const [name, setName] = useState('');
  const [subs, setSubs] = useState<Sub[]>([]);
  const [timer, setTimer] = useState(null);
  const { authenticated, loading } = useAuthState();
  const dispatch = useAuthDispatch();

  const logout = () => {
    axios
      .post('/auth/logout')
      .then(() => {
        dispatch('LOGOUT');
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (name.trim() === '') {
      setSubs([]);
      return;
    }
    searchSubs();
  }, [name]);

  const searchSubs = async () => {
    clearTimeout(timer);
    setTimer(
      setTimeout(async () => {
        try {
          const { data } = await axios.get(`/subs/search/${name}`);

          setSubs(data);
          console.log(data);
        } catch (error) {
          console.log(error);
        }
      }, 300)
    );
  };

  const goToSub = (subName: string) => {
    router.push(`/r/${subName}`);
    setName('');
  };

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-2 bg-white">
      <div className="flex items-center ">
        <Link href="/">
          <a>
            <RedditLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        <span className="hidden text-2xl font-semibold lg:block">
          <Link href="/">readit</Link>
        </span>
      </div>
      <div className="max-w-full px-4 w-160">
        <div className="relative flex items-center border rounded bg-grey-100 hover:bg-white hover:border-blue-500">
          <i className="pl-4 pr-3 fas fa-search text-grey-500"></i>
          <input
            type="text"
            placeholder="Search"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="py-1 pr-3 bg-transparent rounded focus:outline-none"
          ></input>
          <div
            className="absolute left-0 right-0 bg-white"
            style={{ top: '100%' }}
          >
            {subs?.map((sub) => (
              <div
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => goToSub(sub.name)}
              >
                <Image
                  className="rounded-full"
                  src={sub.imageUrl}
                  alt="Sub"
                  height={(8 * 16) / 4}
                  width={(8 * 16) / 4}
                />
                <div className="ml-3 text-sm">
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-gray-600">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex">
        {!loading &&
          (authenticated ? (
            //show logout Buttons
            <button
              onClick={() => logout()}
              className="hidden w-20 py-1 mr-4 leading-4 md:block lg:w-32 hollow blue button"
            >
              Logout
            </button>
          ) : (
            //show login Buttons
            <Fragment>
              <Link href="/login">
                <a className="hidden w-20 py-1 mr-4 leading-4 md:block lg:w-32 hollow blue button">
                  Login
                </a>
              </Link>
              <Link href="/register">
                <a className="hidden w-20 py-1 leading-4 md:block lg:w-32 blue button">
                  Sign up
                </a>
              </Link>
            </Fragment>
          ))}
      </div>
    </div>
  );
};

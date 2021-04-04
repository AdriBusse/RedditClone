import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import InputGroup from '../components/InputGroup';
import { useRouter } from 'next/router';
import { useAuthState } from '../context/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();
  const router = useRouter();

  if (authenticated) {
    router.push('/');
  }
  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&Cs' });
      return;
    }

    try {
      const res = await axios.post('/auth/register', {
        email,
        password,
        username,
      });
      router.push('/login');
    } catch (error) {
      console.log(error);
      setErrors(error.response.data);
      console.log(errors);
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>Register</title>
      </Head>
      <div
        className="w-40 h-screen "
        style={{ backgroundImage: 'url("/images/mosaik.png")' }}
      ></div>
      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our User Agreement and Privacy Police
          </p>

          <form onSubmit={submitForm}>
            <div className="mb-6">
              <input
                type="checkbox"
                className="mr-1 cursor-pointer"
                id="agreement"
                checked={agreement}
                onChange={(e) => setAgreement(!agreement)}
              ></input>
              <label className="text-xs cursor-pointer" htmlFor="agreement">
                I agree to receive emails about cool stuff
              </label>
              <small className="block font-medium text-red-600">
                {errors.agreement}
              </small>
            </div>
            <InputGroup
              className="mb-2"
              value={email}
              setValue={setEmail}
              placeholder="Email"
              error={errors.email}
              type="email"
            ></InputGroup>
            <InputGroup
              className="mb-2"
              value={username}
              setValue={setUsername}
              placeholder="Username"
              error={errors.username}
              type="text"
            ></InputGroup>
            <InputGroup
              className="mb-4"
              value={password}
              setValue={setPassword}
              placeholder="Password"
              error={errors.password}
              type="password"
            ></InputGroup>

            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
              Sign Up
            </button>
          </form>
          <small>
            Allready a Redditor?{' '}
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">LogIn</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

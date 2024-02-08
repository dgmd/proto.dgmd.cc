"use server"

import {
  getAuthServerCache
} from '@/utils/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/auth/authUtils.js';
import {
  redirect
} from 'next/navigation';

import {
  signInAction,
  signUpAction
} from './actions.js';

export default async function UserSignInPage() {

  const {user, error} = await getAuthServerCache();
  if (isAuthUser(user)) {
    redirect('/user');
  }

  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={ signInAction }>Sign in</button>
      <button formAction={ signUpAction }>Sign up</button>
    </form>
  );
};
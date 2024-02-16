"use server"

import {
  buttonClassNames
} from '@/components/look.js';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  redirect
} from 'next/navigation';

import {
  signInAction
} from './actions.js';
import {
  KEY_SIGN_IN_EMAIL,
  KEY_SIGN_IN_PASSWORD
} from './keys.js';

export default async function UserSignInPage() {

  const user = await getAuthServerCache();
  if (isAuthUser(user)) {
    redirect('/admin');
  }

  return (
    <form
      className="max-w-sm mx-auto">
      <div
        className="mb-4">
        <label
          htmlFor="email"
          className="block mb-2">
            Email:
        </label>
        <input
          id="email"
          name={ KEY_SIGN_IN_EMAIL }
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded" />
      </div>
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block mb-2">
            Password:
        </label>
        <input
          id="password"
          name={ KEY_SIGN_IN_PASSWORD }
          type="password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded" />
      </div>
      <button
        formAction={ signInAction }
        className={ buttonClassNames }>
          Sign in
      </button>
    </form>
  );
};
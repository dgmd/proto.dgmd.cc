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

async function UserPage( ) {

  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/user/sign-in');
    return null;
  }

  return <h1>signed in user page</h1>;
}

export default UserPage;
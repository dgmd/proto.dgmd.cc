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

async function AdminPage( ) {

  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
    return null;
  }

  return <h1>signed in admin page</h1>;
}

export default AdminPage;
"use server"

import {
  AdminTable
} from '@/components/admin-table.jsx';
import {
  getAuthServerCache
} from '@/utils/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/auth/authUtils.js';
import {
  headers
} from "next/headers";
import {
  redirect
} from 'next/navigation';

async function AdminPage( request ) {
  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
    return null;
  }

  //todo.. better way to do this?
  const headersList = headers();
  const urlString = headersList.get('referer') || "";
  const urlObject = new URL(urlString);
  const rostersUrl = new URL('/api/rosters', urlObject.origin);
  const rosterData = await fetch( rostersUrl.href );
  const rosterJson = await rosterData.json();

  return (
    <AdminTable/>
  );
}

export default AdminPage;
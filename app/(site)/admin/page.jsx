"use server"

import {
  KEY_ROSTERS_AUTH,
  KEY_ROSTERS_DATA
} from '@/api/rosters/keys';
import {
  AdminTable
} from '@/components/admin-table.jsx';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  cookies
} from "next/headers";
import {
  redirect
} from 'next/navigation';

export default async function AdminPage( x ) {
  const cookieStore = await cookies();
  const auth = await getAuthServerCache(cookieStore);
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
  }

  let data = [];
  const rostersUrl = new URL('/api/rosters', process.env.SITE_ORIGIN);
  const cookieHeaders = await cookies();
  const rosterData = await fetch(rostersUrl.href, {
    method: 'GET',
    headers: { 
      Cookie: cookieHeaders.toString()
    },
    next: { revalidate: 60 }
  });
  const rosterJson = await rosterData.json();
  if (rosterJson[KEY_ROSTERS_AUTH]) {
    data = rosterJson[KEY_ROSTERS_DATA];
  }

  return (
    <AdminTable
      url={ process.env.SITE_ORIGIN }
      data={ data }
    />
  );
};

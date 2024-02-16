"use server"

import {
  KEY_ROSTERS_DATA,
  KEY_ROSTER_AUTH
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

async function AdminPage( x ) {
  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
  }


  let data = [];
  const rostersUrl = new URL('/api/rosters', process.env.SITE_ORIGIN);
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();
  if (rosterJson[KEY_ROSTER_AUTH]) {
    data = rosterJson[KEY_ROSTERS_DATA];
  }

  return (
    <AdminTable
      url={ process.env.SITE_ORIGIN }
      data={ data }
    />
  );
};

export default AdminPage;
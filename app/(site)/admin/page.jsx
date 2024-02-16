"use server"

import {
  KEY_ROSTERS_DATA,
  KEY_ROSTER_AUTH
} from '@/api/rosters/keys';
import {
  AdminTable
} from '@/components/admin-table.jsx';
import {
  useServerPath
} from '@/utils/serverPathHook.js';
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

async function AdminPage() {
  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
  }

  let data = [];
  const urlObject = useServerPath();
  const rostersUrl = new URL('/api/rosters', urlObject.origin);
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();
  if (rosterJson[KEY_ROSTER_AUTH]) {
    data = rosterJson[KEY_ROSTERS_DATA];
  }

  return (
    <AdminTable
      data={data} />
  );
};

export default AdminPage;
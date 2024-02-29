"use server"

import {
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_NAME
} from '@/api/roster-entries/keys';
import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys';
import {
  RosterEntriesTable
} from '@/components/roster-entries-table.jsx';
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

async function Roster( {params} ) {
  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/');
  }

  let data = []
  const rosterId = params[ 'roster-id' ];
  const rostersUrl = new URL('/api/roster-entries', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTERS_DB_ID, rosterId );
  console.log( 'rostersUrl', rostersUrl.href );
  const rosterData = await fetch(rostersUrl.href, {
    method: 'GET',
    headers: { Cookie: cookies().toString() },
    next: { revalidate: 10 }
  });
  const rosterJson = await rosterData.json();
  console.log( 'and?', rostersUrl.href, rosterJson );
  if (rosterJson[KEY_ROSTER_ENTRIES_DATA]) {
    data = rosterJson[KEY_ROSTER_ENTRIES_DATA];
  }
  const rosterName = rosterJson[KEY_ROSTER_ENTRIES_NAME];

  return (
    <RosterEntriesTable
      rosterId={ rosterId }
      name={ rosterName }
      data={ data }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};

export default Roster;
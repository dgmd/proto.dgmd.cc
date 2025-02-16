"use server"

import {
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_ERROR,
  KEY_ROSTER_ENTRIES_NAME
} from '@/api/roster-entries/keys';
import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys';
import {
  RosterEntriesTable
} from '@/components/roster-entries-table.jsx';
import {
  cookies
} from "next/headers";
import {
  redirect
} from 'next/navigation';

export default async function Roster( {params} ) {
  const aparams = await params;
  const rosterId = aparams['roster-id'];
  
  const rostersUrl = new URL('/api/roster-entries', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTERS_DB_ID, rosterId );
  const cookieHeaders = await cookies();
  const rosterData = await fetch(rostersUrl.href, {
    method: 'GET',
    headers: { 
      Cookie: cookieHeaders.toString()
    },
    next: { revalidate: 60 }
  });
  const rosterJson = await rosterData.json();
  if (rosterJson[KEY_ROSTER_ENTRIES_ERROR]) {
    redirect('/');
  }
  const rd = rosterJson[KEY_ROSTER_ENTRIES_DATA];
  const data = rd && Array.isArray(rd) ? rd : [];
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
"use server"

import {
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_NAME
} from '@/api/roster-entries/keys';
import {
  PARAM_ROSTERS_USER_ID
} from '@/api/roster-entry-projects/keys';
import {
  RosterEntryProjectsTable
} from '@/components/roster-entry-projects-table.jsx';
import {
  cookies
} from "next/headers";

async function RosterEntryProjects( {params} ) {
  const dbId = params[ 'group-name' ];
  const userId = params[ 'notion-user-id' ];
  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTERS_USER_ID, userId );
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();
  const data = rosterJson[ KEY_ROSTER_ENTRIES_DATA ];
  return (
    <RosterEntryProjectsTable
      dbId={ dbId }
      userId={ userId }
      data={ data }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};

export default RosterEntryProjects;
"use server"

import {
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_NAME
} from '@/api/roster-entries/keys';
import {
  PARAM_ROSTERS_USER_ID
} from '@/api/roster-entry-projects/keys';
import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys';
import {
  RosterEntryProjectsTable
} from '@/components/roster-entry-projects-table.jsx';
import {
  cookies
} from "next/headers";

async function RosterEntryProjects( {params} ) {

  let data = []
  const dbId = params[ 'group-name' ];
  const userId = params[ 'notion-user-id' ];
  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTERS_DB_ID, dbId );
  rostersUrl.searchParams.append( PARAM_ROSTERS_USER_ID, userId );
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();
  console.log( 'rosterJson', rosterJson );
  return (
    <div>Test</div>
    // <RosterEntryProjectsTable
    //   dbId={ dbId }
    //   name={ rosterName }
    //   data={ data }
    //   url={ process.env.SITE_ORIGIN }
    // />
  );    
};

export default RosterEntryProjects;
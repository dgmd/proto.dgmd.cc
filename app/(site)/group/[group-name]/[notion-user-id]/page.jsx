"use server"

import {
  KEY_ROSTER_ENTRY_PROJECTS_DATA,
  KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME,
  KEY_ROSTER_ENTRY_PROJECTS_NAME,
  PARAM_ROSTER_ENTRY_PROJECTS_USER_ID
} from '@/api/roster-entry-projects/keys.js';
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
  rostersUrl.searchParams.append( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId );
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();
  const data = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ];
  const groupName = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME ];
  const name = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_NAME ];
  return (
    <RosterEntryProjectsTable
      dbId={ dbId }
      userId={ userId }
      data={ data }
      name={ name }
      groupName={ groupName }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};

export default RosterEntryProjects;
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

async function RosterEntryProjects( {params} ) {
  const rosterId = params[ 'roster-id' ];
  const userId = params[ 'user-id' ];
  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId );
  const rosterData = await fetch(rostersUrl.href, {
  });
  const rosterJson = await rosterData.json();
  const data = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ];
  const groupName = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME ];
  const name = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_NAME ];
  return (
    <RosterEntryProjectsTable
      rosterId={ rosterId }
      userId={ userId }
      data={ data }
      name={ name }
      groupName={ groupName }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};

export default RosterEntryProjects;
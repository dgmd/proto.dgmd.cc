"use server"

import {
  KEY_ROSTER_ENTRY_PROJECTS_DATA,
  KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME,
  KEY_ROSTER_ENTRY_USER_NAME,
  PARAM_ROSTER_ENTRY_PROJECTS_USER_ID
} from '@/api/roster-entry-projects/keys.js';
import {
  RosterEntryProjectsTable
} from '@/components/roster-entry-projects-table.jsx';
import {
  redirect
} from 'next/navigation';

export default async function User( {params} ) {
  const rosterId = params[ 'roster-id' ];
  const userId = params[ 'user-id' ];
  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId );
  const rosterData = await fetch( rostersUrl.href, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    // cache: 'no-store',
    next: { revalidate: 60 } // Revalidate every 60 seconds
  } );
  console.log( 'rostersUrl.href3', rostersUrl.href)
  console.log( 'rosterData3', rosterData );
  const rosterJson = await rosterData.json();
  console.log( 'rosterJson', rosterJson );
  const data = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ];
  const groupName = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME ];
  const name = rosterJson[ KEY_ROSTER_ENTRY_USER_NAME ];

  if (!data || !groupName || !name) {
    redirect('/');
  }

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
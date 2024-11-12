"use server"

import {
  KEY_PROJECT_DATA,
  PARAM_PROJECT_ID
} from '@/api/project/keys.js';
import {
  KEY_ROSTER_ENTRY_PROJECTS_DATA,
  KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME,
  KEY_ROSTER_ENTRY_USER_NAME,
  PARAM_ROSTER_ENTRY_PROJECTS_USER_ID
} from '@/api/roster-entry-projects/keys.js';
import {
  ProjectTable
} from '@/components/project-table.jsx';
import {
  QUERY_PARAM_DATABASE
} from 'constants.dgmd.cc';
import {
  find,
  isNil
} from 'lodash-es';
import {
  redirect
} from 'next/navigation';

export default async function Project( {params} ) {
  // const rosterId = params[ 'roster-id' ];
  const userId = params[ 'user-id' ];
  const projectId = params[ 'project-id' ];

  const projectUrl = new URL('/api/project', process.env.SITE_ORIGIN);
  projectUrl.searchParams.append(PARAM_PROJECT_ID, projectId);

  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append(PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId);

  const fetchProjectData = fetch(projectUrl.href, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store'
    },
  }).then(response => response.json());

  const fetchRosterData = fetch(rostersUrl.href, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store'
    },
  }).then(response => response.json());

  const [projectJson, rosterJson] = await Promise.all([
    fetchProjectData,
    fetchRosterData
  ]);

  const snapshotRows = projectJson[KEY_PROJECT_DATA];
  const projectsList = rosterJson[KEY_ROSTER_ENTRY_PROJECTS_DATA];
  const rosterName = rosterJson[KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME];
  const userName = rosterJson[KEY_ROSTER_ENTRY_USER_NAME];
  console.log( 'snapshotRows', snapshotRows, 'projectsList', projectsList, 'rosterName', rosterName, 'userName', userName );
  if (isNil(snapshotRows) || isNil(projectsList) || isNil(rosterName) || isNil(userName)) {
    redirect('/');
  }

  const liveUrl = new URL('/api/query', process.env.SITE_ORIGIN);
  liveUrl.searchParams.append(QUERY_PARAM_DATABASE, projectId);
  const liveRow = [{
    name: 'live data',
    url: liveUrl.href
  }];

  const projectObj = find(projectsList, { 
    PAGE_ID: projectId
  });
  if (isNil(projectObj)) {
    redirect('/');
  }
  const projectName = isNil(projectObj) ? '' : projectObj.VALUE;

  return (
    <ProjectTable
      projectName={ projectName }
      projectId={ projectId }
      userName={ userName }
      rosterName={ rosterName }
      liveRow={ liveRow }
      snapshotRows={ snapshotRows }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};
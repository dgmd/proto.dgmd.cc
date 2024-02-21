"use server"

import {
  KEY_PROJECT_DATA,
  PARAM_PROJECT_ID,
  PARAM_PROJECT_ROSTER_ID,
  PARAM_PROJECT_USER_ID
} from '@/api/project/keys.js';
import {
  KEY_ROSTER_ENTRY_PROJECTS_DATA,
  KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME,
  KEY_ROSTER_ENTRY_PROJECTS_NAME,
  PARAM_ROSTER_ENTRY_PROJECTS_USER_ID
} from '@/api/roster-entry-projects/keys.js';
import {
  ProjectTable
} from '@/components/project-table';

async function Projects( {params} ) {
  const rosterId = params[ 'roster-id' ];
  const userId = params[ 'user-id' ];
  const projectId = params[ 'project-id' ];
  const projectUrl = new URL('/api/project', process.env.SITE_ORIGIN);
  projectUrl.searchParams.append( PARAM_PROJECT_ROSTER_ID, rosterId );
  projectUrl.searchParams.append( PARAM_PROJECT_USER_ID, userId );
  projectUrl.searchParams.append( PARAM_PROJECT_ID, projectId );
  const projectData = await fetch(projectUrl.href, {
    next: { revalidate: 10 }
  });
  const projectJson = await projectData.json();
  const projectList = projectJson[ KEY_PROJECT_DATA ];

  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId );
  const rosterData = await fetch(rostersUrl.href, {
    method: 'GET',
    next: { revalidate: 10 }
  });
  const rosterJson = await rosterData.json();
  const rosterList = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ];
  const groupName = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME ];
  const userName = rosterJson[ KEY_ROSTER_ENTRY_PROJECTS_NAME ];

  console.log( 'projectJson', projectList, groupName, userName );
  return (
    <ProjectTable/>
  );    
};

export default Projects;
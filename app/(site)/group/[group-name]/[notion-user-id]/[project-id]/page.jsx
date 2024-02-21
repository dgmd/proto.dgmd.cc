"use server"

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
  const dbId = params[ 'group-name' ];
  const userId = params[ 'notion-user-id' ];
  const projectId = params[ 'project-id' ];
  const projectUrl = new URL('/api/project', process.env.SITE_ORIGIN);
  // rostersUrl.searchParams.append( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId );
  const projectData = await fetch(projectUrl.href, {
    // headers: { Cookie: cookies().toString() },
  });
  const projectJson = await projectData.json();
  console.log( 'projectJson', projectJson );
  return (
    <ProjectTable/>
  );    
};

export default Projects;
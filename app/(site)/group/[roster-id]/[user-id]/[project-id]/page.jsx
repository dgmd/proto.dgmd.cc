"use server"

import {
  PARAM_PROJECT_ID,
  PARAM_PROJECT_ROSTER_ID,
  PARAM_PROJECT_USER_ID
} from '@/api/project/keys.js';
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

  console.log( 'projectUrl.href', projectUrl.href );
  const projectData = await fetch(projectUrl.href, {
  });
  const projectJson = await projectData.json();
  console.log( 'projectJson', projectJson );
  return (
    <ProjectTable/>
  );    
};

export default Projects;
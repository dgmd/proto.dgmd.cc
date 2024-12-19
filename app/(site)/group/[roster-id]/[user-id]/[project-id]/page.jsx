"use server"

import {
  ProjectLinkTable
} from '@/components/project-link-table.jsx';
import {
  useProjectDataHook
} from '@/utils/projectDataHook.js';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  cookies
} from "next/headers";
import {
  redirect
} from 'next/navigation';

export default async function Project( {params} ) {
  const aparams = await params;
  const rosterId = aparams[ 'roster-id' ];
  const userId = aparams[ 'user-id' ];
  const projectId = aparams[ 'project-id' ];
  
  const {
    error,
    projectName,
    userName,
    rosterName,
    snapshotRows
  } = await useProjectDataHook( userId, projectId );

  if (error) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const auth = await getAuthServerCache(cookieStore);
  const authUser = isAuthUser(auth);

  const liveRow = [{
    date: null,
    id: projectId,
    live: true
  }];

  return (
    <ProjectLinkTable
      projectName={ projectName }
      projectId={ projectId }
      userName={ userName }
      userId={ userId }
      rosterName={ rosterName }
      rosterId={ rosterId }
      liveRow={ liveRow }
      snapshotRows={ snapshotRows }
      url={ process.env.SITE_ORIGIN }
      admin={ authUser }
    />
  );    
};
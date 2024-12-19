"use server"

import {
  RosterEntryProjectsTable
} from '@/components/roster-entry-projects-table.jsx';
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
  isNil
} from 'lodash-es';
import {
  cookies
} from "next/headers";
import {
  redirect
} from 'next/navigation';

export default async function User( {params} ) {
  const aparams = await params;
  const rosterId = aparams[ 'roster-id' ];
  const userId = aparams[ 'user-id' ];

  const {
    error,
    projectsList,
    rosterName,
    userName
  } = await useProjectDataHook( userId );

  if (error || isNil(projectsList) || isNil(rosterName) || isNil(userName)) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const auth = await getAuthServerCache(cookieStore);
  const authUser = isAuthUser(auth);

  return (
    <RosterEntryProjectsTable
      rosterId={ rosterId }
      userId={ userId }
      projectsList={ projectsList }
      userName={ userName }
      rosterName={ rosterName }
      url={ process.env.SITE_ORIGIN }
      admin={ authUser }
    />
  );    
};
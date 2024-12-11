"use server"

import {
  RosterEntryProjectsTable
} from '@/components/roster-entry-projects-table.jsx';
import {
  useProjectDataHook
} from '@/utils/projectDataHook.js';
import {
  isNil
} from 'lodash-es';
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

  if (error) {
    redirect('/');
  }

  if (isNil(projectsList) || isNil(rosterName) || isNil(userName)) {
    redirect('/');
  }

  return (
    <RosterEntryProjectsTable
      rosterId={ rosterId }
      userId={ userId }
      projectsList={ projectsList }
      userName={ userName }
      rosterName={ rosterName }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};
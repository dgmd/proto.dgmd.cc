"use server"

import {
  SnapshotData
} from '@/components/snapshot-data.jsx';
import {
  useProjectDataHook
} from '@/utils/projectDataHook.js';
import {
  redirect
} from 'next/navigation';

export default async function Project( {params} ) {
  const aparams = await params;
  const rosterId = aparams[ 'roster-id' ];
  const userId = aparams[ 'user-id' ];
  const projectId = aparams[ 'project-id' ];
  const snapshotId = aparams[ 'snapshot-id' ];
  const liveSnapshot = snapshotId.startsWith('live-');
  const archiveSnapshot = snapshotId.startsWith('snap-');

  if (!liveSnapshot && !archiveSnapshot) {
    redirect('/');
  }

  const {
    error,
    projectName,
    userName,
    rosterName
  } = await useProjectDataHook( userId, projectId );

  if (error) {
    redirect('/');
  }

  const snapId = snapshotId.substring(5);

  return (
    <SnapshotData
      projectName={ projectName }
      projectId={ projectId }
      userName={ userName }
      rosterName={ rosterName }
      snapshotId={ snapId }
      liveSnapshot={ liveSnapshot }
      url={ process.env.SITE_ORIGIN }
    />
  );    
};
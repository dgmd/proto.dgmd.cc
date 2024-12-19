"use server"

import {
  SnapshotData
} from '@/components/snapshot-data.jsx';
import {
  useProjectDataHook
} from '@/utils/projectDataHook.js';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  getAuthId,
  getAuthUser,
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
    rosterName,
    snapshotRows
  } = await useProjectDataHook( userId, projectId );

  if (error) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const auth = await getAuthServerCache(cookieStore);
  const authUser = isAuthUser(auth);

  const snapId = snapshotId.substring(5);
  const dateText = getDateText(liveSnapshot, snapshotRows, snapId);

  return (
    <SnapshotData
      projectId={ projectId }
      projectName={ projectName }
      userId={ userId }
      userName={ userName }
      rosterId={ rosterId }
      rosterName={ rosterName }
      snapshotId={ snapId }
      snapshotDate={ dateText }
      liveSnapshot={ liveSnapshot }
      url={ process.env.SITE_ORIGIN }
      admin={ authUser }
    />
  );    
};

function getDateText(liveSnapshot, snapshotRows, snapId) {
  if (liveSnapshot) {
    return 'Live Data';
  }
  else {
    const snapshot = snapshotRows.find(row => row.id === snapId);
    if (snapshot && snapshot.date) {
      const date = new Date(snapshot.date);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    else {
      return 'Unknown Date';
    }
  }
}
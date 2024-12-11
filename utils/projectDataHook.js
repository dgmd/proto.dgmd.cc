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
  find,
  isNil
} from 'lodash-es';

const fetchParams = {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  next: { revalidate: 60 }
};

export const useProjectDataHook = async (userId, projectId) => {
  const rostersUrl = new URL('/api/roster-entry-projects', process.env.SITE_ORIGIN);
  rostersUrl.searchParams.append(PARAM_ROSTER_ENTRY_PROJECTS_USER_ID, userId);

  const rosterDataPromise = fetch( rostersUrl.href, fetchParams );

  let projectDataPromise = null;
  if (!isNil(projectId)) {
    const projectUrl = new URL('/api/project', process.env.SITE_ORIGIN);
    projectUrl.searchParams.append(PARAM_PROJECT_ID, projectId);

    projectDataPromise = fetch( projectUrl.href, fetchParams );
  }

  const promises = [rosterDataPromise];
  if (projectDataPromise) {
    promises.push(projectDataPromise);
  }

  const responses = await Promise.all(promises);
  const rosterJson = await responses[0].json();
  const projectJson = projectDataPromise ? await responses[1].json() : null;

  const projectsList = rosterJson[KEY_ROSTER_ENTRY_PROJECTS_DATA];
  const rosterName = rosterJson[KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME];
  const userName = rosterJson[KEY_ROSTER_ENTRY_USER_NAME];

  if (isNil(projectsList) || isNil(rosterName) || isNil(userName)) {
    return { error: true };
  }

  if (!isNil(projectId)) {
    const snapshotRows = projectJson[KEY_PROJECT_DATA];
    if (isNil(snapshotRows)) {
      return { error: true };
    }

    const projectObj = find(projectsList, { PAGE_ID: projectId });
    if (isNil(projectObj)) {
      return { error: true };
    }
    const projectName = projectObj.VALUE;

    return {
      error: false,
      projectName,
      projectsList,
      userName,
      rosterName,
      snapshotRows
    };
  }

  return {
    error: false,
    projectsList,
    userName,
    rosterName
  };
};
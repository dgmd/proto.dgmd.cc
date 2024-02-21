export const maxDuration = 300;

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

import {
  KEY_PROJECTS_DATA,
  KEY_PROJECTS_ERROR,
  PARAM_PROJECT_ID,
  PARAM_PROJECT_ROSTER_ID,
  PARAM_PROJECT_USER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
  };

  try {
    const params = request.nextUrl.searchParams;
    const rosterId = params.get( PARAM_PROJECT_ROSTER_ID );
    const userId = params.get( PARAM_PROJECT_USER_ID );
    const projectId = params.get( PARAM_PROJECT_ID );
    if (isNil(rosterId) || isNil(userId) || isNil(projectId)) {
      throw new Error( 'missing params' );
    }

    const supabase = createClient( );
    const snapsQuery = await supabase
      .from( 'project_snapshots' )
      .select( 'created_at, id' )
      .eq( 'roster_entry_project_id', projectId );
    if (!isNil(snapsQuery.error)) {
      throw new Error( 'cannot connect to snapshots' );
    }
    const snaps = snapsQuery.data;
    rjson[KEY_PROJECTS_DATA] = snaps;

  }
  catch (e) {
    rjson[KEY_PROJECTS_ERROR] = e.message;
    console.log( 'PROJECT GET ERROR', e.message );
  }

  return NextResponse.json( rjson );
};

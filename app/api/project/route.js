export const maxDuration = 300;

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  QUERY_PARAM_DATABASE,
  QUERY_RESPONSE_KEY_SUCCESS
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

import {
  KEY_PROJECT_DATA,
  KEY_PROJECT_ERROR,
  PARAM_PROJECT_ID,
  PARAM_PROJECT_ROSTER_ID,
  PARAM_PROJECT_USER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_PROJECT_DATA]: []
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
    rjson[KEY_PROJECT_DATA] = snaps;

  }
  catch (e) {
    rjson[KEY_PROJECT_ERROR] = e.message;
  }

  return NextResponse.json( rjson );
};

export async function POST( request ) {
  const rjson = {
  };
  try {
    const data = await request.json();
    const pjId = data[PARAM_PROJECT_ID];
    if (isNil(pjId)) {
      throw new Error( 'missing project id' );
    }
    console.log( 'pjId', pjId );

    const liveUrl = new URL('/api/query', process.env.SITE_ORIGIN);
    liveUrl.searchParams.append(QUERY_PARAM_DATABASE, pjId);
    const liveQueryData = await fetch( liveUrl.href, {
      method: 'GET',
      next: { revalidate: 1 }
    } );
    const liveQueryJson = await liveQueryData.json();
    if (!liveQueryJson[QUERY_RESPONSE_KEY_SUCCESS]) {
      throw new Error( 'query failed' );
    }
    
    const supabase = createClient( );
    const insertResult = await supabase
      .from('project_snapshots')
      .insert({ 
        roster_entry_project_id: pjId,
        snapshot: JSON.stringify(liveQueryJson)
      })
      .single();
    if (!isNil(insertResult.error)) {
      throw new Error( 'insert failed' );
    }
    console.log( 'insertResult', insertResult );

  }
  catch (e) {
    rjson[KEY_PROJECT_ERROR] = e.message;
  }

  return NextResponse.json( rjson );
};
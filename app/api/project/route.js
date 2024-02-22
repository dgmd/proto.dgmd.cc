export const maxDuration = 300;

import {
  SNAPSHOT_PARAM_ID
} from '@/api/snapshot/keys.js';
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
  PARAM_PROJECT_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_PROJECT_DATA]: []
  };

  try {
    const params = request.nextUrl.searchParams;
    const projectId = params.get( PARAM_PROJECT_ID );
    if (isNil(projectId)) {
      throw new Error( 'missing project id' );
    }

    const supabase = createClient( );
    const snapsQuery = await supabase
      .from( 'project_snapshots' )
      .select( 'created_at, id' )
      .eq( 'roster_entry_project_id', projectId );
    if (!isNil(snapsQuery.error)) {
      throw new Error( 'cannot connect to snapshots' );
    }


    const mapSnapshotRows = (cur) => {
      const cacheUrl = new URL('/api/snapshot', process.env.SITE_ORIGIN);
      cacheUrl.searchParams.append(SNAPSHOT_PARAM_ID, cur.id);
      return {
        name: cur.created_at,
        url: cacheUrl.href
      };
    };
    const snaps = snapsQuery.data;
    const mSnaps = snaps.map( mapSnapshotRows );

    rjson[KEY_PROJECT_DATA] = mSnaps;
  }
  catch (e) {
    rjson[KEY_PROJECT_ERROR] = e.message;
  }

  return NextResponse.json( rjson );
};

export async function POST( request ) {
  const rjson = {};
  try {
    const data = await request.json();
    const pjId = data[PARAM_PROJECT_ID];
    if (isNil(pjId)) {
      throw new Error( 'missing project id' );
    }

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
      });
    if (!isNil(insertResult.error)) {
      throw new Error( 'insert failed' );
    }
  }
  catch (e) {
    rjson[KEY_PROJECT_ERROR] = e.message;
  }

  return NextResponse.json( rjson );
};
export const maxDuration = 300;

import {
  DATABASE_QUERY_DATABASE_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST,
  getNotionDatabases
} from '@/utils/notion/queryDatabases.js';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  getAuthId,
  getAuthUser,
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  Client
} from "@notionhq/client";
import {
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_ID,
  DGMD_DATABASE_TITLE,
  DGMD_METADATA,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTERS_DATA,
  KEY_ROSTER_AUTH,
  KEY_ROSTER_DELETED,
  KEY_ROSTER_ID,
  PARAM_ROSTERS_DB_ID,
  PARAM_ROSTERS_ROSTER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };

  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }

    const user = getAuthUser( asc );
    const userId = getAuthId( user);
    const supabase = createClient( );

    const activeRosters = await supabase
      .from( 'rosters' )
      .select( 'notion_id, created_at, snapshot_name' )
      .eq( 'active', true )
      .eq( 'user_id', userId );
    
    if (!isNil(activeRosters.error)) {
      throw new Error( 'error getting active rosters' );
    }
    
    const rosters = activeRosters.data;
    rjson[KEY_ROSTER_AUTH] = true;
    rjson[KEY_ROSTERS_DATA] = rosters;
  }
  catch (e) {
    console.log( 'e', e );
  }

  return NextResponse.json( rjson );
};

export async function DELETE( request ) {
  const rjson = {
    [KEY_ROSTER_AUTH]: false,
    [KEY_ROSTER_DELETED]: false,
    [KEY_ROSTER_ID]: null
  };
  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    rjson[KEY_ROSTER_AUTH] = true;

    const user = getAuthUser( asc );
    const userId = getAuthId( user);

    const params = request.nextUrl.searchParams;
    if (!params.has( PARAM_ROSTERS_ROSTER_ID )) {
      throw new Error( 'no roster id' );
    }
    const rosterId = params.get( PARAM_ROSTERS_ROSTER_ID );
    rjson[KEY_ROSTER_ID] = rosterId;

    const supabase = createClient( );
    const deleteRosters = await supabase
      .from( 'rosters' )
      .update( { active: false } )
      .eq( 'user_id', userId )
      .eq( 'notion_id', rosterId );

    if (!isNil(deleteRosters.error)) {
      throw new Error( 'error deleting active rosters' );
    }

    const deleteRosterEntries = await supabase
    .from( 'roster-entries' )
    .update( { active: false } )
    .eq( 'roster', rosterId );
    if (!isNil(deleteRosterEntries.error)) {
      throw new Error( 'error deleting active roster entries' );
    }

    rjson[KEY_ROSTER_DELETED] = true;

  }
  catch (e) {
    console.log( 'e', e );
  }
  return NextResponse.json( rjson );
};

export async function POST( req ) {
  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };
  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }

    const data = await req.json();
    const dbId = data[PARAM_ROSTERS_DB_ID];

    const requests = {
      [DATABASE_QUERY_DATABASE_ID_REQUEST]: dbId,
      [DATABASE_QUERY_PAGE_CURSOR_REQUEST]: {
        [DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST]: DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
        [DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST]: null
      },
    };
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    const db = await getNotionDatabases( nClient, requests );

    const user = getAuthUser( asc );
    const userId = getAuthId( user);

    const supabase = createClient( );

    const getActiveRosters = async () => {
      return await supabase
        .from( 'rosters' )
        .select( 'id, user_id' )
        .eq( 'notion_id', dbId );
    };
    let { 
      data: activeRostersData,
      error: activeRostersError
    } = await getActiveRosters();
    if (!isNil(activeRostersError)) {
      throw new Error( 'error getting active rosters' );
    }

    if (activeRostersData.length === 0) {
      const result = await supabase
        .from( 'rosters' )
        .insert( {
          notion_id: dbId, 
          active: true,
          user_id: userId,
          snapshot_name: db[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_TITLE]
        } );

      const newActiveRosters = await getActiveRosters();
      activeRostersData = newActiveRosters.data;
      activeRostersError = newActiveRosters.error;
    }
    else {
      if (!activeRostersData[0].active) {
        const updatedRoster = await supabase
          .from('rosters')
          .update({ 
            active: true,
            user_id: userId
          })
          .eq('id', activeRostersData[0].id);
        if (updatedRoster.error) {
          throw new Error( 'error reactivating roster' );
        }

        const selectedRoster = await supabase
          .from('rosters')
          .select('id, user_id')
          .eq('id', activeRostersData[0].id);
        if (selectedRoster.error) {
          throw new Error( 'error reactivating roster' );
        }
        activeRostersData = [selectedRoster.data];
      }
      //does the roster belong to someone else?
      if (activeRostersData[0].user_id !== userId) {
        throw new Error( 'roster already exists' );
      }
    }

    rjson[KEY_ROSTER_AUTH] = true;
  }
  catch (e) {
    console.log( 'e', e );
  }
  return NextResponse.json( rjson );
};

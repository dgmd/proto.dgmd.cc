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
  PARAM_ROSTERS_DB_ID,
  PARAM_ROSTERS_ROSTER_ID
} from './keys.js';

export async function GET( req ) {
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
    [KEY_ROSTER_AUTH]: false
  };
  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    const user = getAuthUser( asc );
    const userId = getAuthId( user);

    const params = request.nextUrl.searchParams;
    if (!params.has( PARAM_ROSTERS_ROSTER_ID )) {
      throw new Error( 'no roster id' );
    }
    const rosterId = params.get( PARAM_ROSTERS_ROSTER_ID );


    const supabase = createClient( );
    const deleteRosters = await supabase
      .from( 'rosters' )
      .update( { active: false } )
      .eq( 'notion_id', rosterId );

    if (!isNil(deleteRosters.error)) {
      throw new Error( 'error deleting active rosters' );
    }

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
  const asc = await getAuthServerCache( );
  try {
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
    // not needed
    // await supabase.auth.getUser();

    const getActiveRosters = async () => {
      return await supabase
        .from( 'rosters' )
        .select( 'id' )
        .eq( 'user_id', userId )
        .eq( 'notion_id', dbId );
    };

    //first, does this roster already exist?
    let { 
      data: activeRostersData,
      error: activeRostersError
    } = getActiveRosters();

    if (activeRostersError || activeRostersData.length === 0) {
      const result = await supabase
        .from( 'rosters' )
        .insert( {
          notion_id: dbId, 
          active: true,
          user_id: userId,
          snapshot_name: db[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_TITLE]
        } );

      const newActiveRosters = getActiveRosters();
      activeRostersData = newActiveRosters.data;
      activeRostersError = newActiveRosters.error;
    }
    const roster = activeRostersData[0];
    const rosterId = roster.id;

    //
    // talk to notion to get all roster-entries
    // and then create 
    //
    const dbBlocks = db[DGMD_PRIMARY_DATABASE][DGMD_BLOCKS];
    dbBlocks.forEach( async x => {
      const xProps = x[DGMD_PROPERTIES];
      // const studentId = xProps['Student ID'][DGMD_VALUE];
      const studentName = xProps['Name'][DGMD_VALUE];
      const notionId = x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
      const result = await supabase
        .from( 'roster-entries' )
        .insert( {
          notion_id: notionId, 
          snapshot_name: studentName,
          active: true,
          roster: rosterId
        } );

    } );

  }
  catch (e) {
    console.log( 'e', e );
  }
  return NextResponse.json( rjson );
};

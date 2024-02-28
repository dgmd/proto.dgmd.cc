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
  DGMD_DATABASE_TITLE,
  DGMD_PRIMARY_DATABASE
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTERS_AUTH,
  KEY_ROSTERS_DATA,
  KEY_ROSTERS_DELETED,
  KEY_ROSTERS_ERROR,
  KEY_ROSTERS_ID,
  PARAM_ROSTERS_DB_ID,
  PARAM_ROSTERS_ROSTER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_ROSTERS_AUTH]: false
  };

  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }

    const user = getAuthUser( asc );
    const userId = getAuthId( user);
    const supabase = createClient( );

    const activeRosters = await getActiveRosters( supabase, userId );
    if (!isNil(activeRosters.error)) {
      throw new Error( 'error getting active rosters' );
    }
    console.log( 'ROSTERS', userId, activeRosters.data );
    
    const rosters = activeRosters.data;
    rjson[KEY_ROSTERS_AUTH] = true;
    rjson[KEY_ROSTERS_DATA] = rosters;
  }
  catch (e) {
    console.log( 'ROSTERS GET ERROR', e.message );
  }

  return NextResponse.json( rjson );
};

export async function DELETE( request ) {
  const rjson = {
    [KEY_ROSTERS_AUTH]: false,
    [KEY_ROSTERS_DELETED]: false,
    [KEY_ROSTERS_ID]: null
  };
  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    rjson[KEY_ROSTERS_AUTH] = true;

    const user = getAuthUser( asc );
    const userId = getAuthId( user);

    const params = request.nextUrl.searchParams;
    if (!params.has( PARAM_ROSTERS_ROSTER_ID )) {
      throw new Error( 'no roster id' );
    }
    const rosterId = params.get( PARAM_ROSTERS_ROSTER_ID );
    rjson[KEY_ROSTERS_ID] = rosterId;

    const supabase = createClient( );
    const deleteRosters = await supabase
      .from( 'rosters' )
      .update( { active: false } )
      .eq( 'user_id', userId )
      .eq( 'notion_id', rosterId );

    if (!isNil(deleteRosters.error)) {
      throw new Error( 'error deleting active rosters', {cause: deleteRosters} );
    }

    const deleteRosterEntries = await supabase
      .from( 'roster_entries' )
      .update( { active: false } )
      .eq( 'roster', rosterId );
    if (!isNil(deleteRosterEntries.error)) {
      throw new Error( 'error deleting active roster entries', {cause: deleteRosterEntries} );
    }
    rjson[KEY_ROSTERS_DELETED] = true;

    const activeRosters = await getActiveRosters( supabase, userId );
    if (!isNil(activeRosters.error)) {
      throw new Error( 'error getting active rosters' );
    }
    rjson[KEY_ROSTERS_DATA] = activeRosters.data;
  }
  catch (e) {
    console.log( 'ROSTERS DELETE ERROR', e.message );
  }
  return NextResponse.json( rjson );
};

export async function POST( request ) {
  const rjson = {
    [KEY_ROSTERS_AUTH]: false
  };
  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    rjson[KEY_ROSTERS_AUTH] = true;

    const data = await request.json();
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

    const notionRoster = await supabase
      .from( 'rosters' )
      .select( 'id, user_id, active' )
      .eq( 'notion_id', dbId );

    if (!isNil(notionRoster.error)) {
      throw new Error( 'error getting notion roster', {cause: {notionRoster}} );
    }

    if (notionRoster.data.length === 0) {
      const addRosterResult = await supabase
        .from( 'rosters' )
        .insert( {
          notion_id: dbId, 
          active: true,
          user_id: userId,
          snapshot_name: db[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_TITLE]
        } );
      if (!isNil(addRosterResult.error)) {
        throw new Error( 'error adding roster' );
      }
    }
    else {
      const active = notionRoster.data[0].active;
      //does the roster belong to someone else?
      if (active && notionRoster.data[0].user_id !== userId) {
        throw new Error( `roster already exists with different admin` );
      }

      const updatedRoster = await supabase
        .from('rosters')
        .update({ 
          active: true,
          user_id: userId,
          snapshot_name: db[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_TITLE]
        })
        .eq('id', notionRoster.data[0].id);
      if (!isNil(updatedRoster.error)) {
        throw new Error( 'error reactivating roster' );
      }
    }

    const activeRosters = await getActiveRosters( supabase, userId );
    if (!isNil(activeRosters.error)) {
      throw new Error( 'error getting active rosters' );
    }
    rjson[KEY_ROSTERS_DATA] = activeRosters.data;
    rjson[KEY_ROSTERS_AUTH] = true;
  }
  catch (e) {
    rjson[KEY_ROSTERS_ERROR] = e.message;
    console.log( 'ROSTERS POST ERROR', e.message );
  }
  return NextResponse.json( rjson );
};

const getActiveRosters = async ( supabase, userId ) => {
  return supabase
  .from( 'rosters' )
  .select( 'notion_id, created_at, snapshot_name' )
  .eq( 'active', true )
  .eq( 'user_id', userId );
};
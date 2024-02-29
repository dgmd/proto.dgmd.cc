export const maxDuration = 300;

import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys.js';
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
  cookies
} from 'next/headers';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTER_ENTRIES_AUTH,
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_ERROR,
  KEY_ROSTER_ENTRIES_NAME
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_ROSTER_ENTRIES_AUTH]: false,
    'lalax': true
  };
  rjson['1'] = true;

  try {
    rjson['2'] = true;
    const asc = await getAuthServerCache( );
    rjson['3'] = true;
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    rjson['4'] = true;
    rjson[KEY_ROSTER_ENTRIES_AUTH] = true;

    const params = request.nextUrl.searchParams;
    if (!params.has(PARAM_ROSTERS_DB_ID)) {
      throw new Error( 'no database id' );
    }
    const dbId = params.get(PARAM_ROSTERS_DB_ID);

    const user = getAuthUser( asc );
    const userId = getAuthId( user);
    const cookieStore = cookies();
    const supabase = await createClient( cookieStore );
    const { 
      data: rosterData,
      error: rosterError
    } = await supabase
    .from( 'rosters' )
    .select( 'snapshot_name' )
    .eq( 'active', true )
    .eq( 'user_id', userId )
    .eq( 'notion_id', dbId );
    if (!isNil(rosterError) || rosterData.length === 0) {
      throw new Error( 'roster retrieval error' );
    }
    const rosterDataName = rosterData[0].snapshot_name;
    rjson['a'] = rosterDataName;

    try {
      const request = {
        [DATABASE_QUERY_DATABASE_ID_REQUEST]: dbId,
        [DATABASE_QUERY_PAGE_CURSOR_REQUEST]: {
          [DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST]: DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
          [DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST]: null
        },
      };
      const nClient = new Client({ 
        auth: process.env.NOTION_SECRET
      });
      const db = await getNotionDatabases( nClient, request );
      const dbp = db[DGMD_PRIMARY_DATABASE];
      const dbpTitle = dbp[DGMD_DATABASE_TITLE];
      const dbpBlocks = dbp[DGMD_BLOCKS];
      const notionEntries = dbpBlocks.map( x => {
        const xProps = x[DGMD_PROPERTIES];
        // const studentId = xProps['Student ID'][DGMD_VALUE];
        const studentName = xProps['Name'][DGMD_VALUE];
        const notionId = x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
        return {
          'snapshot_name': studentName,
          'notion_id': notionId
        }
      } );
      rjson[KEY_ROSTER_ENTRIES_NAME] = dbpTitle;
      rjson[KEY_ROSTER_ENTRIES_DATA] = notionEntries;
    }
    catch (e) {
      console.log( 'e', e );
      throw new Error( 'unable to connect to notion' );
    }

    rjson['b'] = rosterDataName;

    if (rjson[KEY_ROSTER_ENTRIES_NAME] !== rosterDataName) {
      await supabase
        .from( 'rosters' )
        .update( {
          'snapshot_name': rjson[KEY_ROSTER_ENTRIES_NAME]
        } )
        .eq( 'active', true )
        .eq( 'user_id', userId )
        .eq( 'notion_id', dbId );        
    }
  }
  catch (e) {
    rjson[KEY_ROSTER_ENTRIES_ERROR] = e.message;
    console.error( 'roster entries error', e.message );
  }

  console.log( 'rosterEntries returning', rjson );

  return NextResponse.json( rjson );
};

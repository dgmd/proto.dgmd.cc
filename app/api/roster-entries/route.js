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
  DGMD_DATABASE_DESCRIPTION,
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
  KEY_ROSTER_ENTRIES_DATA,
  KEY_ROSTER_ENTRIES_DESCRIPTION,
  KEY_ROSTER_ENTRIES_ERROR,
  KEY_ROSTER_ENTRIES_NAME
} from './keys.js';

export async function GET( request ) {
  const rjson = {};

  const canShowRoster = async (dbId) => {
    const cookieStore = await cookies();
    const asc = await getAuthServerCache(cookieStore);
  
    const user = getAuthUser(asc);
    const userId = user ? getAuthId(user) : null;
    const supabase = await createClient(cookieStore);
    
    const { 
      data: rosterData,
      error: rosterError
    } = await supabase
      .from('rosters')
      // Only select minimal data, with count
      .select('id', { count: 'exact'})
      .eq('active', true)
      .or(userId ? `user_id.eq.${userId},public.eq.true` : 'public.eq.true')
      .eq('notion_id', dbId);
      
    if (!isNil(rosterError) || rosterData.length === 0) {
      return false;
    }
    return true;
  };

  try {

    const params = request.nextUrl.searchParams;
    if (!params.has(PARAM_ROSTERS_DB_ID)) {
      throw new Error( 'no database id' );
    }
    const dbId = params.get(PARAM_ROSTERS_DB_ID);

    const proceed = await canShowRoster( dbId );
    if (!proceed) {
      throw new Error( 'not authorized' );
    }

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
      const dpbDesc = dbp[DGMD_DATABASE_DESCRIPTION];
      const dbpBlocks = dbp[DGMD_BLOCKS];
      const notionEntries = dbpBlocks.map( x => {
        const xProps = x[DGMD_PROPERTIES];
        const studentName = xProps['Name'][DGMD_VALUE];
        const notionId = x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
        return {
          'snapshot_name': studentName,
          'notion_id': notionId
        }
      } );
      rjson[KEY_ROSTER_ENTRIES_NAME] = dbpTitle;
      rjson[KEY_ROSTER_ENTRIES_DESCRIPTION] = dpbDesc;
      rjson[KEY_ROSTER_ENTRIES_DATA] = notionEntries;
    }
    catch (e) {
      throw e;
    }

  }
  catch (e) {
    rjson[KEY_ROSTER_ENTRIES_ERROR] = e.message;
    console.error( 'roster entries error', e.message );
  }
  return NextResponse.json( rjson );
};

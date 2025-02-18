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
  const cookieStore = await cookies();
  const asc = await getAuthServerCache( cookieStore );
  try {

    const params = request.nextUrl.searchParams;
    if (!params.has(PARAM_ROSTERS_DB_ID)) {
      throw new Error( 'no database id' );
    }
    const dbId = params.get(PARAM_ROSTERS_DB_ID);

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
      throw new Error( 'unable to connect to notion' );
    }

  }
  catch (e) {
    rjson[KEY_ROSTER_ENTRIES_ERROR] = e.message;
    console.error( 'roster entries error', e.message );
  }
  return NextResponse.json( rjson );
};

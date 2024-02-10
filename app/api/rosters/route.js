export const maxDuration = 300;

import {
  isAuthUser
} from '@/utils/auth/authUtils';
import {
  getNotionDatabases
} from '@/utils/notion/queryDatabases';
import {
  DATABASE_QUERY_DATABASE_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST
} from '@/utils/notion/queryDatabases.js';
import {
  getNotionPageBlocks
} from '@/utils/notion/queryPageBlocks.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  Client
} from "@notionhq/client";
import {
  DGMD_BLOCKS,
  DGMD_PRIMARY_DATABASE
} from 'constants.dgmd.cc';
import {
  cookies
} from 'next/headers';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTER_AUTH,
  PARAM_DB_ID
} from './keys.js';

export async function GET( req ) {
  // const data = await req.json();
  const dbId = 'b293d04aa4aa42bbadb3cc2e17003bfb'; //data[PARAM_DB_ID];

  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const auth = await supabase.auth.getUser();

  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };

  if (isAuthUser(auth) || true) {
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    const request = {
      [DATABASE_QUERY_DATABASE_ID_REQUEST]: dbId,
      [DATABASE_QUERY_PAGE_CURSOR_REQUEST]: {
        [DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST]: DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
        [DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST]: null
      },
    };
    const rosterList = await getNotionDatabases( nClient, request );
    console.log( 'rosterList', rosterList );
    getNotionPageBlocks( nClient, rosterList[DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] );
  }

  // //go get tables for this user and return them

  return NextResponse.json( rjson );
};

export async function POST( req ) {
  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };
  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const auth = await supabase.auth.getUser();
  if (isAuthUser(auth)) {
    const data = await req.json();
    const dbId = data[PARAM_DB_ID];
    if (!isNil(dbId)) {
      rjson[KEY_ROSTER_AUTH] = true;
      //go add table for this user
    }
  }


  return NextResponse.json( rjson );
};

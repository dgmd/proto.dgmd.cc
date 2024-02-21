export const maxDuration = 300;

import {
  NOTION_RESULT_BLOCK_DBS
} from '@/utils/notion/notionWranglerConstants.js';
import {
  getNotionPageBlocks
} from '@/utils/notion/queryPageBlocks.js';
import {
  Client
} from "@notionhq/client";
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTER_ENTRY_PROJECTS_DATA,
  PARAM_ROSTERS_USER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
  };
  const params = request.nextUrl.searchParams;
  const paramUserId = params.get( PARAM_ROSTERS_USER_ID );

  try {
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    const bks = await getNotionPageBlocks( nClient, [paramUserId] );
    if (bks.length === 0) {
      throw new Error( 'no blocks found' );
    }
    rjson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ] = bks[0][NOTION_RESULT_BLOCK_DBS];
  }
  catch (e) {
    throw new Error( 'unable to connect to notion' );
  }

  return NextResponse.json( rjson );
};

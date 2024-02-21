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
  KEY_ROSTER_ENTRY_PROJECTS_ERROR,
  KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME,
  KEY_ROSTER_ENTRY_PROJECTS_NAME,
  PARAM_ROSTER_ENTRY_PROJECTS_USER_ID
} from './keys.js';

export async function GET( request ) {
  const rjson = {
  };
  const params = request.nextUrl.searchParams;
  const paramUserId = params.get( PARAM_ROSTER_ENTRY_PROJECTS_USER_ID );

  try {
    try {
      const nClient = new Client({ 
        auth: process.env.NOTION_SECRET
      });

      rjson[ KEY_ROSTER_ENTRY_PROJECTS_NAME ] = 'Student Name';
      rjson[ KEY_ROSTER_ENTRY_PROJECTS_GROUP_NAME ] = 'Group Name';

      const bks = await getNotionPageBlocks( nClient, [paramUserId] );
      if (bks.length === 0) {
        throw new Error( 'no blocks found' );
      }
      rjson[ KEY_ROSTER_ENTRY_PROJECTS_DATA ] = bks[0][NOTION_RESULT_BLOCK_DBS];
    }
    catch (e) {
      throw new Error( 'unable to connect to notion' );
    }
  }
  catch (e) {
    rjson[ KEY_ROSTER_ENTRY_PROJECTS_ERROR ] = e.message;
  }

  return NextResponse.json( rjson );
};

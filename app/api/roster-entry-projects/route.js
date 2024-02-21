export const maxDuration = 300;

import {
  NOTION_DATA_TYPE_TITLE,
  NOTION_KEY_DBS,
  NOTION_KEY_DB_ID,
  NOTION_KEY_PAGES,
  NOTION_KEY_PAGE_ID,
  NOTION_KEY_PARENT,
  NOTION_KEY_PLAIN_TEXT,
  NOTION_KEY_TYPE,
  NOTION_PROPERTIES,
} from '@/utils/notion/notionConstants.js';
import {
  NOTION_RESULT_BLOCK_DBS
} from '@/utils/notion/notionWranglerConstants.js';
import {
  getNotionDbaseTitle,
  getNotionPageTitle
} from '@/utils/notion/queryDatabases.js';
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
  KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME,
  KEY_ROSTER_ENTRY_USER_NAME,
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

      rjson[ KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME ] = 'Group Name';

      try {
        const userPg = await nClient[NOTION_KEY_PAGES].retrieve({ 
          [NOTION_KEY_PAGE_ID]: paramUserId });
        rjson[ KEY_ROSTER_ENTRY_USER_NAME ] = 
          userPg[NOTION_PROPERTIES].Name[NOTION_DATA_TYPE_TITLE][0][NOTION_KEY_PLAIN_TEXT];
        const parentType = userPg[NOTION_KEY_PARENT][NOTION_KEY_TYPE];
        const parentZone = {
          [NOTION_KEY_DB_ID]: NOTION_KEY_DBS,
          [NOTION_KEY_PAGE_ID]: NOTION_KEY_PAGES
        }[parentType];
        const parentId = userPg[NOTION_KEY_PARENT][parentType];
        const parentPg = await nClient[parentZone].retrieve({ 
          [parentType]: parentId });
        if (parentType === NOTION_KEY_DB_ID) {
          const parentTitle = getNotionDbaseTitle( parentPg );
          rjson[ KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME ] = parentTitle;
        }
        else if (parentType === NOTION_KEY_PAGE_ID) {
          const parentTitle = getNotionPageTitle( parentPg );
          rjson[ KEY_ROSTER_ENTRY_PROJECTS_ROSTER_NAME ] = parentTitle;
        }
      }
      catch (e) {
        throw new Error( 'unable to retrieve user page' );
      }

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

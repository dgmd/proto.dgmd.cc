import {
  Client
} from "@notionhq/client";
import {
  CRUD_PARAM_ACTION,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_RESPONSE_BLOCK,
  CRUD_RESPONSE_BLOCK_ID,
  CRUD_RESPONSE_BLOCK_KEY,
  CRUD_RESPONSE_CREATE,
  CRUD_RESPONSE_CREATE_BLOCKS,
  CRUD_RESPONSE_CREATE_METAS,
  CRUD_RESPONSE_DB_ID,
  CRUD_RESPONSE_DELETE,
  CRUD_RESPONSE_DELETE_ID,
  CRUD_RESPONSE_META,
  CRUD_RESPONSE_META_ID,
  CRUD_RESPONSE_META_KEY,
  CRUD_RESPONSE_PAGE,
  CRUD_RESPONSE_RESULT,
  CRUD_RESPONSE_UPDATE,
  CRUD_RESPONSE_UPDATE_BLOCKS,
  CRUD_RESPONSE_UPDATE_ID,
  CRUD_RESPONSE_UPDATE_METAS,
  CRUD_VALUE_ACTION_CREATE,
  CRUD_VALUE_ACTION_DELETE,
  CRUD_VALUE_ACTION_UPDATE
} from "constants.dgmd.cc";
import {
  NextResponse
} from 'next/server';

import {
  getApiCoriHeaders
} from '../../../utils/coriHeaders.js';
import {
  removeHyphens
} from '../../../utils/strings.js';
import {
  NOTION_DATA_TYPE_COVER,
  NOTION_DATA_TYPE_ICON,
  NOTION_KEY_DATABASE_ID
} from '../notion_constants.js';
import {
  NOTION_WRANGLE_KEY_RELATIONS_MAP
} from '../notion_wrangler_constants.js';
import {
  getNotionDbaseRelationsIds,
  getNotionPageData
} from '../query/route.js';

const SECRET_ID = 'SECRET_ID';

export async function GET( request, response ) {

  const params = request.nextUrl.searchParams;
  const paramAction = params.get( CRUD_PARAM_ACTION );

  const secrets = {
    [SECRET_ID]: process.env.NOTION_SECRET
  };

  const nClient = new Client({ 
    auth: secrets[SECRET_ID]
  });

  if (paramAction === CRUD_VALUE_ACTION_DELETE) {
    const rObj = {
      [CRUD_RESPONSE_RESULT]: {
        [CRUD_RESPONSE_DELETE]: false
      }
    };

    try {
      const deleteBlockId = removeHyphens( params.get(CRUD_PARAM_DELETE_BLOCK_ID) );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DELETE_ID] = deleteBlockId;
      await nClient.blocks.delete( {
        block_id: deleteBlockId
      } );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DELETE] = true;
    }
    catch (error) {
      console.log( 'delete error', error );
    }

    return createResponse( rObj, request );
  }
  else if (paramAction === CRUD_VALUE_ACTION_CREATE) {
    const rObj = {
      [CRUD_RESPONSE_RESULT]: {
        [CRUD_RESPONSE_CREATE]: false,
      }
    };
    try {
      const rBlocks = [];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_BLOCKS] = rBlocks;

      for (const [key, value] of Object.entries(appendChildrenObj)) {
        await updateBlock( nClient, createPageId, key, value, rBlocks );
      }

      const rMetas = [];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_METAS] = rMetas;
      for (const [key, value] of Object.entries(appendMetaObj)) {
        if (key === NOTION_DATA_TYPE_ICON || key === NOTION_DATA_TYPE_COVER) {
          await updateMeta( nClient, createPageId, key, value, rMetas );
        }
      }

      const createdPg = await nClient.pages.retrieve({ page_id: createPageId });
      const x = await getNotionDbaseRelationsIds( nClient, appendBlockId );
      const relMap = x[NOTION_WRANGLE_KEY_RELATIONS_MAP];
      const pg = getNotionPageData( createdPg, relMap );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = pg;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = appendBlockId;

    }
    catch (error) {
      console.log( 'create error', error );
    }
    return createResponse( rObj, request );
  }
  else if (paramAction === CRUD_VALUE_ACTION_UPDATE) {
    const rObj = {
      [CRUD_RESPONSE_RESULT]: {
        [CRUD_RESPONSE_UPDATE]: false
      }
    };
    try {
      const updatePageId = removeHyphens( params.get( CRUD_PARAM_UPDATE_BLOCK_ID ) );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_ID] = updatePageId;
      const updateBlockParam = params.get( CRUD_PARAM_UPDATE_BLOCK );
      const updateBlockObj = JSON.parse( decodeURIComponent(updateBlockParam) );
      const updateMetaParam = params.get( CRUD_PARAM_UPDATE_META );
      const updateMetaObj = JSON.parse( decodeURIComponent(updateMetaParam) );

      const rBlocks = [];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_BLOCKS] = rBlocks;

      for (const [key, value] of Object.entries(updateBlockObj)) {
        await updateBlock( nClient, updatePageId, key, value, rBlocks );
      }

      const rMetas = [];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_METAS] = rMetas;
      for (const [key, value] of Object.entries(updateMetaObj)) {
        if (key === NOTION_DATA_TYPE_ICON || key === NOTION_DATA_TYPE_COVER) {
          await updateMeta( nClient, updatePageId, key, value, rMetas );
        }
      }

      const createdPg = await nClient.pages.retrieve({ page_id: updatePageId });
      const parentId = removeHyphens( createdPg[NOTION_KEY_PARENT][NOTION_KEY_DATABASE_ID] );
      const x = await getNotionDbaseRelationsIds( nClient, parentId );
      const relMap = x[UPDATE_KEY_DATA_RELATIONS_MAP];
      const pg = getNotionPageData( createdPg, relMap );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = parentId;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = pg;
    }
    catch (error) {
    }
    return createResponse( rObj, request );
  }

  return createResponse( {
    [CRUD_RESPONSE_RESULT]: false
  }, request );

};

const createResponse = (json, request) => {
  const resJson = NextResponse.json( json );
  const headersList = getApiCoriHeaders( request );
  for (const header of headersList) {
    resJson.headers.set( header[0], header[1] );
  }
  return resJson;
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const updateBlock = async (nClient, pageId, blockKey, blockValue, responseBlocks) => {
  try {

    //https://www.reddit.com/r/Notion/comments/s8uast/error_deleting_all_the_blocks_in_a_page/
    await delay( 50 );

    const blockResponse =
    await nClient.pages.update({
      page_id: pageId,
      properties: {
        [blockKey]: blockValue
      }
    });
    const blockResponseId = removeHyphens( blockResponse.id );
    responseBlocks.push( {
      [CRUD_RESPONSE_BLOCK]: true,
      [CRUD_RESPONSE_BLOCK_KEY]: blockKey,
      [CRUD_RESPONSE_BLOCK_ID]: blockResponseId
    })
  }
  catch (e) {
    console.log( 'update error', e );
    responseBlocks.push( {
      [CRUD_RESPONSE_BLOCK]: false,
      [CRUD_RESPONSE_BLOCK_KEY]: blockKey,
    } );
  }
};

const updateMeta = async (nClient, pageId, metaKey, metaValue, responseMetas) => {
  try {

    //https://www.reddit.com/r/Notion/comments/s8uast/error_deleting_all_the_blocks_in_a_page/
    await delay( 50 );

    const metaResponse =
    await nClient.pages.update({
      page_id: pageId,
      [metaKey]: metaValue
    });
    const metaResponseId = removeHyphens( metaResponse.id );
    responseMetas.push( {
      [CRUD_RESPONSE_META]: true,
      [CRUD_RESPONSE_META_KEY]: metaKey,
      [CRUD_RESPONSE_META_ID]: metaResponseId
    })
  }
  catch (e) {
    console.log( 'update error', e );
    responseMetas.push( {
      [CRUD_RESPONSE_META]: false,
      [CRUD_RESPONSE_META_KEY]: metaKey,
    } );
  }
};
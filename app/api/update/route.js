import {
  getApiCoriHeaders
} from '@/utils/coriHeaders.js';
import {
  removeHyphens
} from '@/utils/strings.js';
import {
  NOTION_KEY_DATABASE_ID,
  NOTION_KEY_DB_ID,
  NOTION_KEY_ID,
  NOTION_KEY_PAGE_ID,
  NOTION_KEY_PARENT,
  NOTION_RESULTS
} from '@api/notion_constants.js';
import {
  NOTION_WRANGLE_KEY_RELATIONS_MAP
} from '@api/notion_wrangler_constants.js';
import {
  getNotionDbaseProperties,
  getNotionDbaseRelationsIds
} from '@api/query/route.js';
import {
  Client
} from "@notionhq/client";
import {
  CRUD_PARAM_ACTION,
  CRUD_PARAM_CREATE_BLOCK_ID,
  CRUD_PARAM_CREATE_CHILDREN,
  CRUD_PARAM_CREATE_META,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_RESPONSE_BLOCK,
  CRUD_RESPONSE_BLOCK_ID,
  CRUD_RESPONSE_BLOCK_KEY,
  CRUD_RESPONSE_CREATE,
  CRUD_RESPONSE_CREATE_BLOCKS,
  CRUD_RESPONSE_CREATE_ID,
  CRUD_RESPONSE_CREATE_METAS,
  CRUD_RESPONSE_DB_ID,
  CRUD_RESPONSE_DELETE,
  CRUD_RESPONSE_DELETE_ID,
  CRUD_RESPONSE_META,
  CRUD_RESPONSE_META_ID,
  CRUD_RESPONSE_META_KEY,
  CRUD_RESPONSE_PAGE,
  CRUD_RESPONSE_RESULT,
  CRUD_RESPONSE_RESULT_TYPE,
  CRUD_RESPONSE_UPDATE,
  CRUD_RESPONSE_UPDATE_BLOCKS,
  CRUD_RESPONSE_UPDATE_ID,
  CRUD_RESPONSE_UPDATE_METAS,
  CRUD_VALUE_ACTION_CREATE,
  CRUD_VALUE_ACTION_DELETE,
  CRUD_VALUE_ACTION_UPDATE,
  DGMD_BLOCK_TYPE_CHECKBOX,
  DGMD_BLOCK_TYPE_COVER,
  DGMD_BLOCK_TYPE_CREATED_TIME,
  DGMD_BLOCK_TYPE_DATE,
  DGMD_BLOCK_TYPE_EMAIL,
  DGMD_BLOCK_TYPE_EMOJI,
  DGMD_BLOCK_TYPE_FILE_EXTERNAL,
  DGMD_BLOCK_TYPE_ICON,
  DGMD_BLOCK_TYPE_LAST_EDITED_TIME,
  DGMD_BLOCK_TYPE_MULTI_SELECT,
  DGMD_BLOCK_TYPE_NUMBER,
  DGMD_BLOCK_TYPE_PHONE_NUMBER,
  DGMD_BLOCK_TYPE_RELATION,
  DGMD_BLOCK_TYPE_RICH_TEXT,
  DGMD_BLOCK_TYPE_SELECT,
  DGMD_BLOCK_TYPE_STATUS,
  DGMD_BLOCK_TYPE_TITLE,
  DGMD_BLOCK_TYPE_URL,
  DGMD_END_DATE,
  DGMD_START_DATE,
  DGMD_TYPE,
  DGMD_VALUE
} from "constants.dgmd.cc";
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

export async function GET( request ) {

  const params = request.nextUrl.searchParams;
  const paramAction = params.get( CRUD_PARAM_ACTION );


  const nClient = new Client({ 
    auth: process.env.NOTION_SECRET
  });

  if (paramAction === CRUD_VALUE_ACTION_DELETE) {
    const rObj = {
      [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_DELETE,
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
      [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_CREATE,
      [CRUD_RESPONSE_RESULT]: {
        [CRUD_RESPONSE_CREATE]: false,
      }
    };
    try {
      const appendDbId = removeHyphens( params.get( CRUD_PARAM_CREATE_BLOCK_ID ) );

      const appendPropsParam = params.get( CRUD_PARAM_CREATE_CHILDREN );
      const appendPropsObj = JSON.parse( decodeURIComponent(appendPropsParam) );
      const appendNotionPropsObj = {};
      for (const [key, userBlock] of Object.entries(appendPropsObj)) {
        const mmBlock = mmPropToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          appendNotionPropsObj[key] = mmBlock;
        }
      }

      const appendMetasParam = params.get( CRUD_PARAM_CREATE_META );
      const appendMetasObj = JSON.parse( decodeURIComponent(appendMetasParam) );
      const appendNotionMetaObj = {};
      for (const [key, userBlock] of Object.entries(appendMetasObj)) {
        const mmBlock = mmMetaToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          appendNotionMetaObj[key] = mmBlock;
        }
      }

      const createObj = await nClient.pages.create({
        parent: {
          type: NOTION_KEY_DB_ID,
          [NOTION_KEY_DB_ID]: appendDbId
        },
        properties: {},
        children: [],
      });
      const createPageId = removeHyphens( createObj[NOTION_KEY_ID] );
      
      const rBlocks = [];
      for (const [key, value] of Object.entries(appendNotionPropsObj)) {
        await updateBlock( nClient, createPageId, key, value, rBlocks );
      }
      const rMetas = [];
      for (const [key, value] of Object.entries(appendNotionMetaObj)) {
        if (key === DGMD_BLOCK_TYPE_ICON || key === DGMD_BLOCK_TYPE_COVER) {
          await updateMeta( nClient, createPageId, key, value, rMetas );
        }
      }

      const createdPg = await nClient.pages.retrieve({ [NOTION_KEY_PAGE_ID]: createPageId });
      const x = await getNotionDbaseRelationsIds( nClient, appendDbId );
      const relMap = x[NOTION_WRANGLE_KEY_RELATIONS_MAP];
      const pgs = getNotionDbaseProperties( {[NOTION_RESULTS]: [createdPg]}, relMap );

      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = pgs[0];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE] = true;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = appendDbId;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_ID] = createPageId;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_BLOCKS] = rBlocks;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_METAS] = rMetas;
    }
    catch (error) {
      console.log( 'create error', error );
    }
    return createResponse( rObj, request );
  }
  else if (paramAction === CRUD_VALUE_ACTION_UPDATE) {
    const rObj = {
      [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_UPDATE,
      [CRUD_RESPONSE_RESULT]: {
        [CRUD_RESPONSE_UPDATE]: false
      }
    };
    try {
      const updatePageId = removeHyphens( params.get( CRUD_PARAM_UPDATE_BLOCK_ID ) );
      const updateBlockParam = params.get( CRUD_PARAM_UPDATE_BLOCK );
      const pgUpdateProps = JSON.parse( decodeURIComponent(updateBlockParam) );
      const updatePropObj = {};
      for (const [key, userBlock] of Object.entries(pgUpdateProps)) {
        const mmBlock = mmPropToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          updatePropObj[key] = mmBlock;
        }
      }

      const updateMetaParam = params.get( CRUD_PARAM_UPDATE_META );
      const pgUpdateMetas = JSON.parse( decodeURIComponent(updateMetaParam) );
      const updateMetaObj = {};
      for (const [key, userBlock] of Object.entries(pgUpdateMetas)) {
        const mmBlock = mmMetaToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          updateMetaObj[key] = mmBlock;
        }
      }

      const rBlocks = [];
      for (const [key, value] of Object.entries(updatePropObj)) {
        await updateBlock( nClient, updatePageId, key, value, rBlocks );
      }

      const rMetas = [];
      for (const [key, value] of Object.entries(updateMetaObj)) {
        if (key === DGMD_BLOCK_TYPE_ICON || key === DGMD_BLOCK_TYPE_COVER) {
          await updateMeta( nClient, updatePageId, key, value, rMetas );
        }
      }

      const createdPg = await nClient.pages.retrieve({ [NOTION_KEY_PAGE_ID]: updatePageId });
      const parentId = removeHyphens( createdPg[NOTION_KEY_PARENT][NOTION_KEY_DATABASE_ID] );
      const x = await getNotionDbaseRelationsIds( nClient, parentId );
      const relMap = x[NOTION_WRANGLE_KEY_RELATIONS_MAP];
      const pgs = getNotionDbaseProperties( {[NOTION_RESULTS]: [createdPg]}, relMap );
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = parentId;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = pgs[0];
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE] = true;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_ID] = updatePageId;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_METAS] = rMetas;
      rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_BLOCKS] = rBlocks;
    }
    catch (error) {
      console.log( 'error', error );
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

//
//  BLOCK UPDATE CONVERTERS
const mmPropToNotionBlock = ( block ) => {
  const type = block[DGMD_TYPE];
  const value = block[DGMD_VALUE];

  if ([
    DGMD_BLOCK_TYPE_CREATED_TIME,
    DGMD_BLOCK_TYPE_LAST_EDITED_TIME
  ].includes( type )) {
    return null;
  }

  if (DGMD_BLOCK_TYPE_DATE === type) {
    const startDateValue = new Date( value[DGMD_START_DATE] );
    if (isFinite(startDateValue)) {
      const dateObj = {
        [DGMD_START_DATE]: startDateValue.toISOString()
      };
      const endDateValue = new Date( value[DGMD_END_DATE] );
      if (isFinite(endDateValue)) {
        dateObj[DGMD_END_DATE] = endDateValue.toISOString();
      }
      return {
        [type]: dateObj
      };
    }
  }

  if ([DGMD_BLOCK_TYPE_TITLE, DGMD_BLOCK_TYPE_RICH_TEXT].includes( type )) {
    const stringValue = String( value );
    return {
      [type]: [ {
        "text": {
          "content": stringValue
        }
      } ]
    };
  }

  if ([DGMD_BLOCK_TYPE_PHONE_NUMBER, DGMD_BLOCK_TYPE_URL, DGMD_BLOCK_TYPE_EMAIL].includes( type )) {
    const stringValue = String( value );
    return {
      [type]: stringValue
    };
  }

  if (type === DGMD_BLOCK_TYPE_SELECT || type === DGMD_BLOCK_TYPE_STATUS) {
    const stringValue = String( value );
    return {
      [type]: {
        "name": stringValue
      }
    };
  }
  if (type === DGMD_BLOCK_TYPE_NUMBER) {
    const numValue = Number( value );
    if (isFinite(numValue)) {
      return {
        [type]: numValue
      };
    }
  }
  if (type === DGMD_BLOCK_TYPE_MULTI_SELECT) {
    if (Array.isArray(value)) {
      const selects = value.map( v => {
        return {
          "name": String(v)
        };
      } );

      return {
        [type]: selects
      };
    }
  }
  if (type === DGMD_BLOCK_TYPE_CHECKBOX) {
    const booleanValue = deriveBoolean( value );
    return {
      [type]: booleanValue
    };
  }
  // #https://developers.notion.com/reference/page-property-values#relation
  if (type === DGMD_BLOCK_TYPE_RELATION) {
    if (Array.isArray(value)) {

      if (value.every( v => typeof v === 'string' )) {
        return {
          [type]: value.map( v => {
            return {
              "id": v
            };
          } )
        };
      }
      return {
        [type]: value
      };
    }
  }
  
  return null;
};
  
const mmMetaToNotionBlock = ( block ) => {
  const type = block[DGMD_TYPE];
  const value = block[DGMD_VALUE];
  if (type === DGMD_BLOCK_TYPE_EMOJI) {
    return {
      [type]: value,
    }
  }
  if (type === DGMD_BLOCK_TYPE_FILE_EXTERNAL) {
    return {
      "type": type,
      "external": {
        "url": value
      }
    }
  }
};

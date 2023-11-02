  import {
    NextResponse
  } from 'next/server';
  
  import {
    Client
  } from "@notionhq/client";

  import {
    getApiCoriHeaders
  } from '../../../utils/coriHeaders.js';

  import {
    removeHyphens
  } from '../../../utils/strings.js';

  import {
    CRUD_RESPONSE_RESULT,
    CRUD_RESPONSE_DELETE,
    CRUD_RESPONSE_DELETE_ID,
    CRUD_RESPONSE_CREATE,
    CRUD_RESPONSE_CREATE_ID,
    CRUD_RESPONSE_CREATE_BLOCKS,
    CRUD_RESPONSE_UPDATE_ID,
    CRUD_RESPONSE_UPDATE_BLOCKS,
    URL_SEARCH_PARAM_ACTION,
    URL_SEARCH_VALUE_ACTION_DELETE,
    URL_SEARCH_PARAM_DELETE_BLOCK_ID,
    URL_SEARCH_VALUE_ACTION_CREATE,
    URL_SEARCH_PARAM_CREATE_BLOCK_ID,
    URL_SEARCH_PARAM_CREATE_CHILDREN,
    URL_SEARCH_VALUE_ACTION_UPDATE,
    URL_SEARCH_PARAM_UPDATE_BLOCK_ID,
    URL_SEARCH_PARAM_UPDATE_BLOCK,
    CRUD_RESPONSE_BLOCK,
    CRUD_RESPONSE_BLOCK_KEY,
    CRUD_RESPONSE_BLOCK_ID
  } from './keys.js';
  
  const SECRET_ID = 'SECRET_ID';
  const DATABASE_ID = 'DATABASE_ID';

  export async function GET( request, response ) {

    const params = request.nextUrl.searchParams;
    const paramAction = params.get( URL_SEARCH_PARAM_ACTION );

    const secrets = {
      [SECRET_ID]: process.env.NOTION_SECRET,
      [DATABASE_ID]: null
    };
    const nClient = new Client({ 
      auth: secrets[SECRET_ID]
    });

    if (paramAction === URL_SEARCH_VALUE_ACTION_DELETE) {
      const rObj = {
        [CRUD_RESPONSE_RESULT]: {
          [CRUD_RESPONSE_DELETE]: false
        }
      };
      try {
        const deleteBlockId = removeHyphens( params.get(URL_SEARCH_PARAM_DELETE_BLOCK_ID) );
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
    else if (paramAction === URL_SEARCH_VALUE_ACTION_CREATE) {
      const rObj = {
        [CRUD_RESPONSE_RESULT]: {
          [CRUD_RESPONSE_CREATE]: false
        }
      };
      try {
        const appendBlockId = removeHyphens( params.get( URL_SEARCH_PARAM_CREATE_BLOCK_ID ) );
        const appendChildrenParam = params.get( URL_SEARCH_PARAM_CREATE_CHILDREN );
        const appendChildrenObj = JSON.parse( decodeURIComponent(appendChildrenParam) );

        const createObj = await nClient.pages.create({
          parent: {
            type: 'database_id',
            database_id: appendBlockId
          },
          properties: {},
          children: [],
        });
        const createBlockId = removeHyphens( createObj.id );
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE] = true;
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_ID] = createBlockId;
        const rBlocks = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_BLOCKS] = rBlocks;

        for (const [key, value] of Object.entries(appendChildrenObj)) {
          await updateBlock( nClient, createBlockId, key, value, rBlocks );
        }

      }
      catch (error) {
        console.log( 'create error', error );
      }
      return createResponse( rObj, request );
    }
    else if (paramAction === URL_SEARCH_VALUE_ACTION_UPDATE) {
      const rObj = {
        [CRUD_RESPONSE_RESULT]: {}
      };
      try {
        const updateBlockId = removeHyphens( params.get(URL_SEARCH_PARAM_UPDATE_BLOCK_ID) );
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_ID] = updateBlockId;
        const updateBlockParam = params.get( URL_SEARCH_PARAM_UPDATE_BLOCK );
        const updateBlockObj = JSON.parse( decodeURIComponent(updateBlockParam) );

        const rBlocks = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_BLOCKS] = rBlocks;

        for (const [key, value] of Object.entries(updateBlockObj)) {
          await updateBlock( nClient, updateBlockId, key, value, rBlocks );
        }
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

  const updateBlock = async (nClient, blockId, blockKey, blockValue, responseBlocks) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    try {

      //https://www.reddit.com/r/Notion/comments/s8uast/error_deleting_all_the_blocks_in_a_page/
      await delay( 50 );

      const blockResponse =
      await nClient.pages.update({
        page_id: blockId,
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
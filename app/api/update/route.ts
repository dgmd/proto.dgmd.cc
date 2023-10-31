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
    CRUD_RESPONSE_SUCCESS,
    URL_SEARCH_PARAM_ACTION,
    URL_SEARCH_VALUE_ACTION_DELETE,
    URL_SEARCH_PARAM_DELETE_BLOCK_ID,
    URL_SEARCH_VALUE_ACTION_APPEND,
    URL_SEARCH_PARAM_APPEND_BLOCK_ID,
    URL_SEARCH_PARAM_APPEND_CHILDREN,
    URL_SEARCH_VALUE_ACTION_UPDATE,
    URL_SEARCH_PARAM_UPDATE_BLOCK_ID,
    URL_SEARCH_PARAM_UPDATE_BLOCK
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
      const deleteBlockId = params.get(URL_SEARCH_PARAM_DELETE_BLOCK_ID);
      const rObj = {
        [CRUD_RESPONSE_SUCCESS]: false
      };
      try {
        const response = await nClient.blocks.delete( {
          block_id: deleteBlockId
        } );
        // console.log( 'response', response );
        rObj[CRUD_RESPONSE_SUCCESS] = true;
      }
      catch (error) {
        console.log( 'error', error );
      }
      return createResponse( rObj, request );
    }
    else if (paramAction === URL_SEARCH_VALUE_ACTION_APPEND) {
      const rObj = {
        [CRUD_RESPONSE_SUCCESS]: false
      };
      try {
        const appendBlockId = params.get(URL_SEARCH_PARAM_APPEND_BLOCK_ID);
        const appendChildrenParam = params.get(URL_SEARCH_PARAM_APPEND_CHILDREN);
        const appendChildrenObj = JSON.parse( decodeURIComponent(appendChildrenParam) );

        await nClient.pages.create({
          parent: {
            type: 'database_id',
            database_id: appendBlockId
          },
          properties: appendChildrenObj,
          children: [],
        });
        rObj[CRUD_RESPONSE_SUCCESS] = true;
      }
      catch (error) {
        console.log( 'error', error );
      }
      return createResponse( rObj, request );
    }
    else if (paramAction === URL_SEARCH_VALUE_ACTION_UPDATE) {
      const rObj = {
        [CRUD_RESPONSE_SUCCESS]: false
      };
      try {
        const updateBlockId = params.get(URL_SEARCH_PARAM_UPDATE_BLOCK_ID);
        const updateBlockParam = params.get( URL_SEARCH_PARAM_UPDATE_BLOCK );
        const updateBlockObj = JSON.parse( decodeURIComponent(updateBlockParam) );

        const response = await nClient.pages.update({
          page_id: updateBlockId,
          properties: updateBlockObj
        });
        rObj[CRUD_RESPONSE_SUCCESS] = true;
      }
      catch (error) {
        console.log( 'error', error );
      }
      return createResponse( rObj, request );
    }

    return createResponse( {
      [CRUD_RESPONSE_SUCCESS]: false
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
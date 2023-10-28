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
    URL_SEARCH_PARAM_DELETE_BLOCK_ID
  } from './keys.js';
  
  const NOTION_ID = 'id';
  const DGMDCC_ID = 'id';
  
  const NOTION_URL = 'url';
  const DGMDCC_URL = 'url';
  
  const NOTION_RESULTS = 'results';
  const NOTION_PROPERTIES = 'properties';
  
  const NOTION_DATA_TYPE = 'type';
  const NOTION_DATA_TYPE_NUMBER = 'number';
  const NOTION_DATA_TYPE_SELECT = 'select';
  const NOTION_DATA_TYPE_MULTI_SELECT = 'multi_select';
  const NOTION_DATA_TYPE_FILES = 'files';
  const NOTION_DATA_TYPE_TITLE = 'title';
  const NOTION_DATA_TYPE_RICH_TEXT = 'rich_text';
  const NOTION_DATA_TYPE_RELATION = 'relation';
  
  const NOTION_KEY_NAME = 'name';
  const NOTION_KEY_FILE = 'file';
  const NOTION_KEY_URL = 'url';
  const NOTION_KEY_PLAIN_TEXT = 'plain_text';
  const NOTION_KEY_DATABASE_ID = 'database_id';
  const NOTION_KEY_ID = 'id';
  
  const NOTION_KEY_RELATION = 'relation';
  
  const QUERY_PREFIX = 'QUERY_PREFIX';
  const QUERY_KEY = 'QUERY_KEY';
  const QUERY_PROPERTIES = 'QUERY_PROPERTIES';
  
  const NOTION_RESULT_PRIMARY_DATABASE = 'NOTION_RESULT_PRIMARY_DATABASE';
  const NOTION_RESULT_RELATION_DATABASES = 'NOTION_RESULT_RELATION_DATABASES';
  
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
      const rObj = {};
      try {
        const response = await nClient.blocks.delete( {block_id: deleteBlockId} );
        // console.log( 'response', response );
        rObj[CRUD_RESPONSE_SUCCESS] = true;
      }
      catch (error) {
        console.error( 'error', error );
        rObj[CRUD_RESPONSE_SUCCESS] = false;
      }
      return createResponse( rObj, request );
    }


  
    // // connect to NOTION
    // const notionSecret = SECRET_ID;
    // const nClient = new Client({ 
    //   auth: notionSecret
    // });
  
    // const pageId = '87d1d139-0f1a-4739-a0de-ecf275928d59';
    // const response = await nClient.pages.update({
    //   page_id: pageId,
  
    //   properties: {
    //     'name': {
    //       title: [{
    //         text: {
    //           content: 'soy protein'
    //         }
    //       }]
    //     }
    //   }
    // });
    // console.log(response);
  
  
    return NextResponse.json( { hello: 'world' } );
  
  };

  const createResponse = (json, request) => {
    const resJson = NextResponse.json( json );
    const headersList = getApiCoriHeaders( request );
    for (const header of headersList) {
      resJson.headers.set( header[0], header[1] );
    }
    return resJson;
  };
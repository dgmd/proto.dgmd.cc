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
    getNotionDbaseRelationsIds,
    getNotionPageData
  } from '../query/route';

  import {
    CRUD_RESPONSE_SUCCESS,
    CRUD_RESPONSE_RESULT,
    CRUD_RESPONSE_DELETE,
    CRUD_RESPONSE_DELETE_ID,
    CRUD_RESPONSE_CREATE,
    CRUD_RESPONSE_CREATE_ID,
    CRUD_RESPONSE_CREATE_BLOCKS,
    CRUD_RESPONSE_CREATE_METAS,
    CRUD_RESPONSE_META,
    CRUD_RESPONSE_META_KEY,
    CRUD_RESPONSE_META_ID,
    CRUD_RESPONSE_UPDATE,
    CRUD_RESPONSE_UPDATE_PAGE_ID,
    CRUD_RESPONSE_UPDATE_BLOCKS,
    CRUD_RESPONSE_UPDATE_METAS,
    URL_SEARCH_PARAM_PRIMARY_DATABASE_ID,
    URL_SEARCH_PARAM_ACTION,
    URL_SEARCH_VALUE_ACTION_DELETE,
    URL_SEARCH_PARAM_DELETE_BLOCK_ID,
    URL_SEARCH_VALUE_ACTION_CREATE,
    URL_SEARCH_PARAM_CREATE_BLOCK_ID,
    URL_SEARCH_PARAM_CREATE_CHILDREN,
    URL_SEARCH_PARAM_CREATE_META,
    URL_SEARCH_VALUE_ACTION_UPDATE,
    URL_SEARCH_PARAM_UPDATE_BLOCK_ID,
    URL_SEARCH_PARAM_UPDATE_BLOCK,
    URL_SEARCH_PARAM_UPDATE_META,
    CRUD_RESPONSE_BLOCK,
    CRUD_RESPONSE_BLOCK_KEY,
    CRUD_RESPONSE_BLOCK_ID
  } from './keys.js';
  
  const SECRET_ID = 'SECRET_ID';

  export async function GET( request, response ) {

    const params = request.nextUrl.searchParams;
    const paramAction = params.get( URL_SEARCH_PARAM_ACTION );

    const secrets = {
      [SECRET_ID]: process.env.NOTION_SECRET
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
        const appendMetaParam = params.get( URL_SEARCH_PARAM_CREATE_META );
        const appendMetaObj = JSON.parse( decodeURIComponent(appendMetaParam) );

        const createObj = await nClient.pages.create({
          parent: {
            type: 'database_id',
            database_id: appendBlockId
          },
          properties: {},
          children: [],
        });
        const createPageId = removeHyphens( createObj.id );
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE] = true;
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_ID] = createPageId;
        const rBlocks = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_BLOCKS] = rBlocks;

        for (const [key, value] of Object.entries(appendChildrenObj)) {
          await updateBlock( nClient, createPageId, key, value, rBlocks );
        }

        const rMetas = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_METAS] = rMetas;
        for (const [key, value] of Object.entries(appendMetaObj)) {
          if (key === 'icon' || key === 'cover') {
            await updateMeta( nClient, createPageId, key, value, rMetas );
          }
        }

        const createdPg = await nClient.pages.retrieve({ page_id: createPageId });
        const x = await getNotionDbaseRelationsIds( nClient, appendBlockId );
        const relMap = x['relMap'];
        const pg = getNotionPageData( createdPg, relMap );
        rObj[CRUD_RESPONSE_RESULT]['page'] = pg;
        rObj[CRUD_RESPONSE_RESULT]['dbId'] = appendBlockId;

      }
      catch (error) {
        console.log( 'create error', error );
      }
      return createResponse( rObj, request );
    }
    else if (paramAction === URL_SEARCH_VALUE_ACTION_UPDATE) {
      const rObj = {
        [CRUD_RESPONSE_RESULT]: {
          [CRUD_RESPONSE_UPDATE]: false
        }
      };
      try {
        const updatePageId = removeHyphens( params.get(URL_SEARCH_PARAM_UPDATE_BLOCK_ID) );
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE] = true;
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_PAGE_ID] = updatePageId;
        const updateBlockParam = params.get( URL_SEARCH_PARAM_UPDATE_BLOCK );
        const updateBlockObj = JSON.parse( decodeURIComponent(updateBlockParam) );
        const updateMetaParam = params.get( URL_SEARCH_PARAM_UPDATE_META );
        const updateMetaObj = JSON.parse( decodeURIComponent(updateMetaParam) );

        const rBlocks = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_BLOCKS] = rBlocks;

        for (const [key, value] of Object.entries(updateBlockObj)) {
          await updateBlock( nClient, updatePageId, key, value, rBlocks );
        }

        const rMetas = [];
        rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_METAS] = rMetas;
        for (const [key, value] of Object.entries(updateMetaObj)) {
          if (key === 'icon' || key === 'cover') {
            await updateMeta( nClient, updatePageId, key, value, rMetas );
          }
        }

        const createdPg = await nClient.pages.retrieve({ page_id: updatePageId });
        const parentId = removeHyphens( createdPg['parent']['database_id'] );
        const x = await getNotionDbaseRelationsIds( nClient, parentId );
        const relMap = x['relMap'];
        const pg = getNotionPageData( createdPg, relMap );
        rObj[CRUD_RESPONSE_RESULT]['dbId'] = parentId;
        rObj[CRUD_RESPONSE_RESULT]['page'] = pg;
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
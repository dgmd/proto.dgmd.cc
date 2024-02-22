export const maxDuration = 300;

import {
  getApiCorsHeaders
} from '@/utils/coriHeaders.js';
import {
  DATABASE_QUERY_DATABASE_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_DEFAULT,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC,
  getNotionDatabases
} from '@/utils/notion/queryDatabases.js';
import {
  Client
} from "@notionhq/client";
import {
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_RESPONSE_KEY_ERROR,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS,
  QUERY_VALUE_PAGE_CURSOR_TYPE_ALL,
  QUERY_VALUE_PAGE_CURSOR_TYPE_DEFAULT,
  QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC
} from 'constants.dgmd.cc';
import {
  NextResponse
} from 'next/server';

const queryPagesLookupTable = {
  [QUERY_VALUE_PAGE_CURSOR_TYPE_ALL]: DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
  [QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC]: DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC,
  [QUERY_VALUE_PAGE_CURSOR_TYPE_DEFAULT]: DATABASE_QUERY_PAGE_CURSOR_TYPE_DEFAULT
};

export async function GET( request ) {

  const requests = {
    [DATABASE_QUERY_DATABASE_ID_REQUEST]: null,
    [DATABASE_QUERY_PAGE_CURSOR_REQUEST]: {
      [DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST]: DATABASE_QUERY_PAGE_CURSOR_TYPE_DEFAULT,
      [DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST]: null
    },
  };

  const params = request.nextUrl.searchParams;
  if (params.has(QUERY_PARAM_DATABASE)) {
    const dbId = params.get(QUERY_PARAM_DATABASE);
    requests[DATABASE_QUERY_DATABASE_ID_REQUEST] = dbId;
  }

  if (params.has(QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST)) {
    const pcs = params.get(QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST);
    const cursorReq = queryPagesLookupTable[pcs];
    if (cursorReq) {
      requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_TYPE_REQUEST] = cursorReq;
    }
  }

  if (params.has(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST)) {
    const pcid = params.get(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST);
    requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_ID_REQUEST] = pcid;
  }

  try {
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });

    const orgDbResult = await getNotionDatabases( nClient, requests );

    return createResponse( {
      [QUERY_RESPONSE_KEY_SUCCESS]: true,
      [QUERY_RESPONSE_KEY_RESULT]: orgDbResult
    }, request );
  
  }
  catch ( e ) {
    console.log( e );
    return createResponse( {
      [QUERY_RESPONSE_KEY_SUCCESS]: false,
      [QUERY_RESPONSE_KEY_ERROR]: 'invalid credentials'
    }, request );
  }
};

const createResponse = (json, request) => {
  const resJson = NextResponse.json( json );
  const headersList = getApiCorsHeaders( request );
  for (const header of headersList) {
    resJson.headers.set( header[0], header[1] );
  }
  return resJson;
};

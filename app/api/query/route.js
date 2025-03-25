export const maxDuration = 300;

import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  DATABASE_QUERY_DATABASE_ID_REQUEST,
  DATABASE_QUERY_INCLUDE_RELATIONSHIPS,
  DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_DEFAULT,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST,
  DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC,
  DATABASE_QUERY_PRIMARY_IDS_PROPERTY,
  DATABASE_QUERY_PRIMARY_TITLE_PROPERTY,
  DATABASE_QUERY_RESULT_COUNT,
  getNotionDatabases
} from '@/utils/notion/queryDatabases.js';
import {
  Client
} from "@notionhq/client";
import {
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_INCLUDE_RELATIONSHIPS,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_PARAM_PRIMARY_IDS_PROPERTY,
  QUERY_PARAM_PRIMARY_TITLE_PROPERTY,
  QUERY_PARAM_RESULT_COUNT,
  QUERY_RESPONSE_KEY_ERROR,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS,
  QUERY_VALUE_PAGE_CURSOR_TYPE_ALL,
  QUERY_VALUE_PAGE_CURSOR_TYPE_DEFAULT,
  QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC,
  QUERY_VALUE_RESULT_COUNT_ALL,
} from 'constants.dgmd.cc';

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
    [DATABASE_QUERY_INCLUDE_RELATIONSHIPS]: true,
    [DATABASE_QUERY_RESULT_COUNT]: Number.POSITIVE_INFINITY
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
      requests[DATABASE_QUERY_PAGE_CURSOR_REQUEST][DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST] = cursorReq;
    }
  }

  if (params.has(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST)) {
    const pcid = params.get(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST);
    requests[DATABASE_QUERY_PAGE_CURSOR_REQUEST][DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST] = pcid;
  }

  if (params.has(QUERY_PARAM_INCLUDE_RELATIONSHIPS)) {
    const ir = params.get(QUERY_PARAM_INCLUDE_RELATIONSHIPS).toLowerCase();
    requests[DATABASE_QUERY_INCLUDE_RELATIONSHIPS] = ['true', '1', 't'].includes(ir);
  }

  if (params.has(QUERY_PARAM_RESULT_COUNT)) {
    const rc = params.get(QUERY_PARAM_RESULT_COUNT);
    if (rc === QUERY_VALUE_RESULT_COUNT_ALL) {
      requests[DATABASE_QUERY_RESULT_COUNT] = Number.POSITIVE_INFINITY;
    }
    else {
      const numValue = parseInt(rc, 10);
      if (!isNaN(numValue) && numValue > 0) {
        requests[DATABASE_QUERY_RESULT_COUNT] = numValue;
      }
    }
  }

  if (params.has(QUERY_PARAM_PRIMARY_TITLE_PROPERTY)) {
    requests[DATABASE_QUERY_RESULT_COUNT] = Number.POSITIVE_INFINITY;
    const title = params.get(QUERY_PARAM_PRIMARY_TITLE_PROPERTY);
    requests[DATABASE_QUERY_PRIMARY_TITLE_PROPERTY] = title;
  }
  else if (params.has(QUERY_PARAM_PRIMARY_IDS_PROPERTY)) {
    requests[DATABASE_QUERY_RESULT_COUNT] = Number.POSITIVE_INFINITY;
    const ids = params.get(QUERY_PARAM_PRIMARY_IDS_PROPERTY);
    requests[DATABASE_QUERY_PRIMARY_IDS_PROPERTY] = ids;
  }

  try {
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });

    const orgDbResult = await getNotionDatabases( nClient, requests );

    return createCorsHeadedResponse( {
      [QUERY_RESPONSE_KEY_SUCCESS]: true,
      [QUERY_RESPONSE_KEY_RESULT]: orgDbResult
    }, request );
  
  }
  catch ( e ) {
    return createCorsHeadedResponse( {
      [QUERY_RESPONSE_KEY_SUCCESS]: false,
      [QUERY_RESPONSE_KEY_ERROR]: 'invalid credentials'
    }, request );
  }
};


export const maxDuration = 300;

import {
  Client
} from "@notionhq/client";
import {
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_CHECKBOX,
  DGMD_BLOCK_TYPE_COVER,
  DGMD_BLOCK_TYPE_CREATED_TIME,
  DGMD_BLOCK_TYPE_DATE,
  DGMD_BLOCK_TYPE_EMAIL,
  DGMD_BLOCK_TYPE_FILE_EXTERNAL,
  DGMD_BLOCK_TYPE_FORMULA,
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
  DGMD_DATABASE_ID,
  DGMD_DATABASE_TITLE,
  DGMD_END_DATE,
  DGMD_METADATA,
  DGMD_PAGE_DATA,
  DGMD_PARENT_ID,
  DGMD_PARENT_TITLE,
  DGMD_PARENT_TYPE,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASES,
  DGMD_START_DATE,
  DGMD_TIME_ZONE,
  DGMD_TYPE,
  DGMD_VALUE,
  QUERY_PARAM_BLOCKS_REQUEST,
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_RESPONSE_KEY_ERROR,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS
} from 'constants.dgmd.cc';
import {
  NextResponse
} from 'next/server';

import {
  getApiCoriHeaders
} from '../../../utils/coriHeaders.js';
import {
  areAllMapSetsEmpty
} from '../../../utils/lists.js';
import {
  removeHyphens
} from '../../../utils/strings.js';
import {
  NOTION_DATA_TYPE_CHECKBOX,
  NOTION_DATA_TYPE_CHILD_DATABASE,
  NOTION_DATA_TYPE_COLUMN,
  NOTION_DATA_TYPE_COLUMN_LIST,
  NOTION_DATA_TYPE_COVER,
  NOTION_DATA_TYPE_CREATED_TIME,
  NOTION_DATA_TYPE_DATE,
  NOTION_DATA_TYPE_EMAIL,
  NOTION_DATA_TYPE_EMOJI,
  NOTION_DATA_TYPE_EXTERNAL,
  NOTION_DATA_TYPE_FILE,
  NOTION_DATA_TYPE_FILES,
  NOTION_DATA_TYPE_FORMULA,
  NOTION_DATA_TYPE_ICON,
  NOTION_DATA_TYPE_LAST_EDITED_TIME,
  NOTION_DATA_TYPE_MULTI_SELECT,
  NOTION_DATA_TYPE_NUMBER,
  NOTION_DATA_TYPE_PHONE_NUMBER,
  NOTION_DATA_TYPE_RELATION,
  NOTION_DATA_TYPE_RICH_TEXT,
  NOTION_DATA_TYPE_SELECT,
  NOTION_DATA_TYPE_STATUS,
  NOTION_DATA_TYPE_TITLE,
  NOTION_DATA_TYPE_URL,
  NOTION_HAS_MORE,
  NOTION_KEY_DATABASE_ID,
  NOTION_KEY_END_DATE,
  NOTION_KEY_FILE,
  NOTION_KEY_ID,
  NOTION_KEY_NAME,
  NOTION_KEY_PAGE_ID,
  NOTION_KEY_PARENT,
  NOTION_KEY_PLAIN_TEXT,
  NOTION_KEY_START_CURSOR,
  NOTION_KEY_START_DATE,
  NOTION_KEY_TIME_ZONE,
  NOTION_KEY_TYPE,
  NOTION_KEY_VALUE,
  NOTION_NEXT_CURSOR,
  NOTION_PROPERTIES,
  NOTION_RESULTS,
} from '../notion_constants.js';
import {
  NOTION_WRANGLE_KEY_DATA_DB_MAP,
  NOTION_WRANGLE_KEY_RELATIONS_MAP
} from '../notion_wrangler_constants.js';

const DGMDCC_ID = 'id';

const QUERY_PROPERTIES = 'QUERY_PROPERTIES';
const QUERY_PAGES = 'QUERY_PAGES';

const SECRET_ID = 'SECRET_ID';
const DATABASE_ID_REQUEST = 'DATABASE_ID_REQUEST';
const RELATIONS_REQUEST = 'RELATIONS_REQUEST';
const BLOCKS_REQUEST = 'BLOCKS_REQUEST';
const PAGE_CURSOR_REQUEST = 'PAGE_CURSOR_REQUEST';
const PAGE_CURSOR_TYPE_REQUEST = 'PAGE_CURSOR_TYPE_REQUEST';
const PAGE_CURSOR_ID_REQUEST = 'PAGE_CURSOR_ID_REQUEST';
const PAGE_CURSOR_TYPE_DEFAULT = 'PAGE_CURSOR_TYPE_DEFAULT';
const PAGE_CURSOR_TYPE_SPECIFIC = 'PAGE_CURSOR_TYPE_SPECIFIC';
const PAGE_CURSOR_TYPE_ALL = 'PAGE_CURSOR_TYPE_ALL';

const DATABASE_QUERY_PRIMARY = 'DATABASE_QUERY_PRIMARY';
const DATABASE_QUERY_ID = 'DATABASE_QUERY_ID';
const DATABASE_QUERY_TITLE = 'DATABASE_QUERY_TITLE';
const DATABASE_QUERY_PARENT_ID = 'DATABASE_QUERY_PARENT_ID';
const DATABASE_QUERY_PAGE_CURSOR_TYPE = 'DATABASE_QUERY_PAGE_CURSOR_TYPE';
const DATABASE_QUERY_PAGE_CURSOR_ID = 'DATABASE_QUERY_PAGE_CURSOR_ID';
const DATABASE_QUERY_PARENT_TITLE = 'DATABASE_QUERY_PARENT_TITLE';
const DATABASE_QUERY_PARENT_TYPE = 'DATABASE_QUERY_PARENT_TYPE';
const DATABASE_QUERY_COVER = 'DATABASE_QUERY_COVER';
const DATABASE_QUERY_ICON = 'DATABASE_QUERY_ICON';

const NOTION_WRANGLE_LOCAL_LOADED_PAGE_ID = 'NOTION_WRANGLE_LOCAL_LOADED_PAGE_ID';
const NOTION_WRANGLE_LOCAL_LOADED_PAGE = 'NOTION_WRANGLE_LOCAL_LOADED_PAGE';
const NOTION_WRANGLE_LOCAL_LOADED_DB_ID = 'NOTION_WRANGLE_LOCAL_LOADED_DB_ID';
const NOTION_WRANGLE_LOCAL_RELATION_PAGE_ID = 'NOTION_WRANGLE_LOCAL_RELATION_PAGE_ID';
const NOTION_WRANGLE_LOCAL_RELATION_DATABASE_ID = 'NOTION_WRANGLE_LOCAL_RELATION_DATABASE_ID';
const NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR = 'NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR';
const NOTION_WRANGLE_LOCAL_NDBP_NEXT = 'NOTION_WRANGLE_LOCAL_NDBP_NEXT';

export async function GET( request, response ) {

  const secrets = {
    [SECRET_ID]: process.env.NOTION_SECRET
  };

  const requests = {
    [RELATIONS_REQUEST]: true,
    [BLOCKS_REQUEST]: false,
    [DATABASE_ID_REQUEST]: null,
    [PAGE_CURSOR_REQUEST]: {
      [PAGE_CURSOR_TYPE_REQUEST]: PAGE_CURSOR_TYPE_ALL,
      [PAGE_CURSOR_ID_REQUEST]: null
    },
  };

  const params = request.nextUrl.searchParams;
  if (params.has(QUERY_PARAM_DATABASE)) {
    const dbId = params.get(QUERY_PARAM_DATABASE);
    requests[DATABASE_ID_REQUEST] = dbId;
  }
  if (params.has(QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST)) {
    const pcs = params.get(QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST);
    const cursorReq = {
      [SEARCH_VALUE_PAGE_CURSOR_TYPE_ALL]: PAGE_CURSOR_TYPE_ALL,
      [SEARCH_VALUE_PAGE_CURSOR_TYPE_SPECIFIC]: PAGE_CURSOR_TYPE_SPECIFIC,
      [SEARCH_VALUE_PAGE_CURSOR_TYPE_DEFAULT]: PAGE_CURSOR_TYPE_DEFAULT
    }[pcs];
    if (cursorReq) {
      requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_TYPE_REQUEST] = cursorReq;
    }
  }

  if (params.has(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST)) {
    const pcid = params.get(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST);
    requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_ID_REQUEST] = pcid;
  }

  if (params.has(QUERY_PARAM_BLOCKS_REQUEST)) {
    const blocksReq = params.get(QUERY_PARAM_BLOCKS_REQUEST);
    requests[BLOCKS_REQUEST] = deriveBoolean(blocksReq);
  }
  try {

    const nClient = new Client({ 
      auth: secrets[SECRET_ID]
    });

    const primaryDbId = requests[DATABASE_ID_REQUEST];
    const x = await getNotionDbaseRelationsIds( nClient, primaryDbId );

    const dbMap = x[NOTION_WRANGLE_KEY_DATA_DB_MAP];
    const relMap = x[NOTION_WRANGLE_KEY_RELATIONS_MAP];

    const metasMap = new Map();
    for (const [dbId, db] of dbMap.entries()) {
      const primary = dbId === primaryDbId;
      const pageReq = primary ? requests[PAGE_CURSOR_REQUEST] : PAGE_CURSOR_TYPE_ALL;
      const meta = getDbMeta( primary, dbId, pageReq );
      notionUpdateDbMeta( nClient, db, meta );
      metasMap.set( dbId, meta );
    }
    const nDbMeta = metasMap.get( primaryDbId );
    const nDbResult = await getNotionDbase( 
      nClient, nDbMeta, primaryDbId, relMap.get(primaryDbId) );
    const nDbProps = nDbResult[QUERY_PROPERTIES];
    const nDbPages = nDbResult[QUERY_PAGES];

    const unloadedPageIds = new Map();
    const loadedPageIds = new Map();
    const matchedPageIds = new Map();
    const dbPagination = new Map( );
    //todo... if there is another related table which needs rows in primary
    //and we started loading from a specific page... then we need to load all pages
    //and need to skip the one we "started" from
    const pageReqObj = requests[PAGE_CURSOR_REQUEST];
    const primaryDbPageType= pageReqObj[PAGE_CURSOR_TYPE_REQUEST];
    const specificPg = primaryDbPageType === PAGE_CURSOR_TYPE_SPECIFIC;
    const primaryLastPageCursorId = specificPg ? null : pageReqObj[PAGE_CURSOR_ID_REQUEST];
    dbPagination.set( primaryDbId, {
      lastPageCursorId: primaryLastPageCursorId,
      complete: !nDbPages[NOTION_HAS_MORE]
    } );

    await loadRelatedDbs(
      nClient, relMap, primaryDbId, nDbProps, unloadedPageIds, loadedPageIds, matchedPageIds, dbPagination );

    const rDbResults = [];
    const matchedPageIdsArray = Array.from(matchedPageIds.entries());
    for (const [dbId, pgSet] of matchedPageIdsArray) {
      const dbBlocks = Array.from(pgSet.keys()).map( 
        pgId => loadedPageIds.get(pgId)[NOTION_WRANGLE_LOCAL_LOADED_PAGE] );
      const rDb = makeDbSerialized( dbBlocks, null, metasMap.get(dbId) );
      rDbResults.push( rDb );
    }
    
    const nDbSerial = makeDbSerialized( nDbProps, nDbPages, nDbMeta );
    const orgDbResult = {
      [DGMD_PRIMARY_DATABASE]: nDbSerial,
      [DGMD_RELATION_DATABASES]: rDbResults
    };

    if (requests[BLOCKS_REQUEST]) {
      const allDbResults = [nDbResult, ...rDbResults];
      const blocks = await loadBlocks( nClient, allDbResults );
      orgDbResult[DGMD_BLOCKS] = blocks;
    }

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
  const headersList = getApiCoriHeaders( request );
  for (const header of headersList) {
    resJson.headers.set( header[0], header[1] );
  }
  return resJson;
};

const makeDbSerialized = (props, pages, meta) => {
  const s = {
    [DGMD_BLOCKS]: props,
    [DGMD_DATABASE_ID]: meta[DATABASE_QUERY_ID],
    [DGMD_DATABASE_TITLE]: meta[DATABASE_QUERY_TITLE],
    [DGMD_PARENT_ID]: meta[DATABASE_QUERY_PARENT_TITLE],
    [DGMD_PARENT_TITLE]: meta[DATABASE_QUERY_PARENT_ID],
    [DGMD_PARENT_TYPE]: meta[DATABASE_QUERY_PARENT_TYPE],
    [DGMD_BLOCK_TYPE_ICON]: meta[DATABASE_QUERY_ICON],
    [DGMD_BLOCK_TYPE_COVER]: meta[DATABASE_QUERY_COVER],
  };
  if (pages) {
    s[DGMD_PAGE_DATA] = pages;
  }
  return s;
};


const trackLoadedPages =
  (dbId, propertyPages, unloadedPageIds, loadedPageIds, dbTracker) => {

  for (const page of propertyPages) {
    const meta = page[DGMD_METADATA];
    const pageId = meta[DGMDCC_ID][DGMD_VALUE];
    if (!loadedPageIds.has(pageId)) {
      loadedPageIds.set(pageId, {
        [NOTION_WRANGLE_LOCAL_LOADED_PAGE_ID]: pageId,
        [NOTION_WRANGLE_LOCAL_LOADED_PAGE]: page,
        [NOTION_WRANGLE_LOCAL_LOADED_DB_ID]: dbId
      });
    }

    if (unloadedPageIds.has(dbId)) {
      const unloaded = unloadedPageIds.get(dbId).delete(pageId);
      if (unloaded) {
        if (!dbTracker.has(dbId)) {
          dbTracker.set(dbId, new Set());
        }
        dbTracker.get(dbId).add(pageId);
      }

    }
  }

  for (const page of propertyPages) {
    const props = page[DGMD_PROPERTIES];
    const propKeys = Object.keys(props);
    for (const propKey of propKeys) {
      const prop = props[propKey];
      if (NOTION_DATA_TYPE_RELATION === prop[DGMD_TYPE]) {
        const propVals = prop[DGMD_VALUE];
        for (const propValObj of propVals) {
          const propRelPgId = propValObj[NOTION_WRANGLE_LOCAL_RELATION_PAGE_ID];
          const propRelDbId = propValObj[NOTION_WRANGLE_LOCAL_RELATION_DATABASE_ID];

          if (!loadedPageIds.has(propRelPgId)) {
            if (!unloadedPageIds.has(propRelDbId)) {
              unloadedPageIds.set(propRelDbId, new Set());
            }
            unloadedPageIds.get(propRelDbId).add( propRelPgId );
          }
        }
      }
    }
  }

};

const chainLoadRelatedDbs = async (
  nClient, relMap, unloadedPageIds, loadedPageIds, dbTracker, dbPagination ) => {
  const anyLeft = !areAllMapSetsEmpty( unloadedPageIds );
  if (anyLeft) {
    for (const [dbId, unloadedSet] of unloadedPageIds) {
      if (!dbPagination.has(dbId)) {
        dbPagination.set( dbId, {
          lastPageCursorId: null,
          complete: false
        } );
      }
      const dbPaginationObj = dbPagination.get(dbId);
      let pageCursorId = dbPaginationObj.lastPageCursorId;
      let keepSeaching = unloadedSet.size !== 0;
      while( keepSeaching ) {
        const meta = {
          [DATABASE_QUERY_PAGE_CURSOR_TYPE]: PAGE_CURSOR_TYPE_SPECIFIC,
          [DATABASE_QUERY_PAGE_CURSOR_ID]: pageCursorId
        };
        const db = await getNotionDbase(
          nClient, meta, dbId, relMap.get(dbId) );
        pageCursorId = db[QUERY_PAGES][NOTION_NEXT_CURSOR];
        dbPaginationObj.lastPageCursorId = pageCursorId;
        const lastPagination = pageCursorId === null;
        if (lastPagination) {
          dbPaginationObj.complete = true;
        }

        const dbProps = db[QUERY_PROPERTIES];
        trackLoadedPages( dbId, dbProps, unloadedPageIds, loadedPageIds, dbTracker );

        const unloadedPagesSize = unloadedPageIds.get(dbId).size;

        //do it again if... we have more pages to load
        //or we have more result pages to load
        keepSeaching = unloadedPagesSize !== 0 && !lastPagination;
      }
    }
    return chainLoadRelatedDbs( nClient, relMap, unloadedPageIds, loadedPageIds, dbTracker, dbPagination );
  }
  else {
    return Promise.resolve();
  }
};

const loadRelatedDbs = async(
  nClient, relMap, dbId, dbProps, unloadedPageIds, loadedPageIds, dbTracker, dbPagination) => {
  trackLoadedPages( dbId, dbProps, unloadedPageIds, loadedPageIds, dbTracker );
  return chainLoadRelatedDbs( nClient, relMap, unloadedPageIds, loadedPageIds, dbTracker, dbPagination );
};

const getNotionDbaseRelationPromise = async (nClient, dbId, collector) => {
  const db = await nClient.databases.retrieve({
    [NOTION_KEY_DATABASE_ID]: dbId
  });

  const relMap = collector[NOTION_WRANGLE_KEY_RELATIONS_MAP];
  const dbMap = collector[NOTION_WRANGLE_KEY_DATA_DB_MAP];
  dbMap.set( dbId, db );

  const nextDbIds = new Set();

  const ndbProperties = db[NOTION_PROPERTIES];
  const ndbPropertiesKeys = Object.keys( ndbProperties );
  for (const ndbPropertiesKey of ndbPropertiesKeys) {
    //ndbPropertiesKey is the dbase property title
    const ndpPropertyVal = ndbProperties[ndbPropertiesKey];
    const ndpPropertyType = ndpPropertyVal[NOTION_KEY_TYPE];
    if (ndpPropertyType === NOTION_DATA_TYPE_RELATION) {
      const propertyValId = ndpPropertyVal[NOTION_KEY_ID];
      const relation = ndpPropertyVal[NOTION_DATA_TYPE_RELATION];
      const dbaseId = relation[NOTION_KEY_DATABASE_ID];
      const dbaseIdSansHyphens = removeHyphens( dbaseId );
      nextDbIds.add( dbaseIdSansHyphens );
      if (!relMap.has( dbId )) {
        relMap.set( dbId, new Map() );
      }
      const dbRelMap = relMap.get( dbId );
      dbRelMap.set( propertyValId, dbaseIdSansHyphens );
    }
  }
  return Array.from(nextDbIds.keys());
};

const chainNotionDbaseRelationIds = async (nClient, dbId, collector) => {
  const nextDbIds = await getNotionDbaseRelationPromise(nClient, dbId, collector);
  for (const nextDbId of nextDbIds) {
    if (!collector[NOTION_WRANGLE_KEY_DATA_DB_MAP].has(nextDbId)) {
      await chainNotionDbaseRelationIds(
        nClient, nextDbId, collector);
    }
  }
  return Promise.resolve(collector);
};

const getNotionDbaseRelationsIds = ( nClient, dbId ) => {
  const collector = {
    [NOTION_WRANGLE_KEY_RELATIONS_MAP]: new Map(),
    [NOTION_WRANGLE_KEY_DATA_DB_MAP]: new Map()
  };
  return chainNotionDbaseRelationIds( nClient, dbId, collector );
};

//all of this nonsense because title is not in the typescript
//https://github.com/makenotion/notion-sdk-js/issues/471
const getNotionDbaseTitle = notionDbases => {
  for (const [key, value] of Object.entries(notionDbases)) {
    if (key === NOTION_DATA_TYPE_TITLE) {
      return value[0][NOTION_KEY_PLAIN_TEXT];
    }
  }
};

const getNotionDbaseParentId = nDatabase => {
  for (const [key, value] of Object.entries(nDatabase)) {
    if (key === NOTION_KEY_PARENT) {
      const parentType = value[NOTION_KEY_TYPE];
      const parentId = removeHyphens( value[parentType] );
      return [parentId, parentType]
    }
  }
};

const getNotionPageTitle = nPage => {
  const props = nPage.properties;
  for (const [key, value] of Object.entries(props)) {
    if (value[NOTION_KEY_TYPE] === NOTION_DATA_TYPE_TITLE) {
      const title = value[NOTION_DATA_TYPE_TITLE][0][NOTION_KEY_PLAIN_TEXT];
      return title;
    }
  }
};

const getNotionDbaseProperties = (notionDatas, relMap) => {
  if (NOTION_RESULTS in notionDatas) {
    const data = notionDatas[NOTION_RESULTS].map( (resultData, index) => {
      const metadata = {};
      const propdata = {};
      const somedata = {
        [DGMD_METADATA]: metadata,
        [DGMD_PROPERTIES]: propdata
      };
      const keys = Object.keys( resultData );
      for (const key of keys) {
        if (key === NOTION_KEY_ID) {

          const id = resultData[key];
          const idSansHyphens = removeHyphens( id );

          metadata[DGMDCC_ID] = {
            [DGMD_TYPE]: DGMDCC_ID,
            [DGMD_VALUE]: idSansHyphens
          };
        }
        else if (key === NOTION_DATA_TYPE_ICON) {
          //todo: handle type here correctly
          const iconObj = getIcon( resultData[key] );
          metadata[NOTION_DATA_TYPE_ICON] = {
            [DGMD_TYPE]: iconObj[NOTION_KEY_TYPE],
            [DGMD_VALUE]: iconObj[NOTION_KEY_VALUE]
          };
        }
        else if (key === NOTION_DATA_TYPE_COVER) {
          //todo: handle type here correctly
          const coverObj = getCover( resultData[key] );
          metadata[NOTION_DATA_TYPE_COVER] = {
            [DGMD_TYPE]: coverObj[NOTION_KEY_TYPE],
            [DGMD_VALUE]: coverObj[NOTION_KEY_VALUE]
          };
        }
        else if (key === NOTION_PROPERTIES) {
          const properties = resultData[key];
          const propertyKeys = Object.keys( properties );
          for (const propertyKey of propertyKeys) {

            const propertyObj = properties[propertyKey];
            const propertyType = propertyObj[NOTION_KEY_TYPE];
            const propertyVal = propertyObj[propertyType];
            const gotPropertyVal = propertyVal !== null && propertyVal !== undefined;

            if (gotPropertyVal) {
              if (propertyType === NOTION_DATA_TYPE_SELECT) {

                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_SELECT,
                  [DGMD_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_MULTI_SELECT) {
                
                const multis = propertyVal.map( m => m[NOTION_KEY_NAME] );
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_MULTI_SELECT,
                  [DGMD_VALUE]: multis
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_FILES) {
                const files = propertyVal.reduce( (acc, cur) => {
                  if (NOTION_KEY_EXTERNAL in cur) {
                    acc.push( cur[NOTION_KEY_EXTERNAL][NOTION_KEY_URL] );
                  }
                  else if (NOTION_KEY_FILE in cur) {
                    acc.push( cur[NOTION_KEY_FILE][NOTION_KEY_URL] );
                  }
                  return acc;
                 }, [] );
                const file = files.length > 0 ? files[0] : null;
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_FILE_EXTERNAL,
                  [DGMD_VALUE]: file
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_NUMBER) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_NUMBER,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_CHECKBOX) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_CHECKBOX,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_URL) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_URL,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_EMAIL) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_EMAIL,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_PHONE_NUMBER) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_PHONE_NUMBER,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_STATUS) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_STATUS,
                  [DGMD_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_TITLE || propertyType == NOTION_DATA_TYPE_RICH_TEXT) {
                const titles = propertyVal.map( m => m[NOTION_KEY_PLAIN_TEXT] );
                const val = titles.length > 0 ? titles.join('') : null;
                const type = propertyType == NOTION_DATA_TYPE_TITLE ? 
                  DGMD_BLOCK_TYPE_TITLE : DGMD_BLOCK_TYPE_RICH_TEXT;

                propdata[propertyKey] = {
                  [DGMD_TYPE]: type,
                  [DGMD_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_RELATION) {
                const notionPropertyId = propertyObj[NOTION_KEY_ID];
                const dbId = relMap.get( notionPropertyId );
                const val = propertyVal.map( m => {
                  return {
                    [NOTION_WRANGLE_LOCAL_RELATION_DATABASE_ID]: dbId,
                    [NOTION_WRANGLE_LOCAL_RELATION_PAGE_ID]: removeHyphens( m[NOTION_KEY_ID] )
                  } }
                );
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_RELATION,
                  [DGMD_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_DATE) {
                const dateVal = convertDateFromNotionToDGMD( propertyVal );
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_DATE,
                  [DGMD_VALUE]: dateVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_LAST_EDITED_TIME) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_LAST_EDITED_TIME,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_CREATED_TIME) {
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_CREATED_TIME,
                  [DGMD_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_FORMULA) {
                const formulaType = propertyVal[NOTION_KEY_TYPE];
                if (formulaType === NOTION_DATA_TYPE_DATE) {
                  const dgmdDateVal = convertDateFromNotionToDGMD( propertyVal[formulaType] );
                  propdata[propertyKey] = {
                    [DGMD_TYPE]: DGMD_BLOCK_TYPE_FORMULA,
                    [DGMD_VALUE]: dgmdDateVal
                  };
                }
                else {
                  //todo: lookup table here for correct typing
                  propdata[propertyKey] = {
                    [DGMD_TYPE]: propertyType,
                    [DGMD_VALUE]: propertyVal
                  };
                }
              }
              else {
                // todo... handle other types
                // console.log(
                //   '***',
                //   'propertyType', propertyType,
                //   'prototypeKey', propertyKey
                // );
              }
            }
            else {
              if ([
                NOTION_DATA_TYPE_SELECT,
                NOTION_DATA_TYPE_MULTI_SELECT,
                NOTION_DATA_TYPE_FILES,
                NOTION_DATA_TYPE_NUMBER,
                NOTION_DATA_TYPE_TITLE,
                NOTION_DATA_TYPE_CHECKBOX,
                NOTION_DATA_TYPE_RICH_TEXT,
                NOTION_DATA_TYPE_RELATION,
                NOTION_DATA_TYPE_DATE,
                NOTION_DATA_TYPE_EMAIL,
                NOTION_DATA_TYPE_PHONE_NUMBER,
                NOTION_DATA_TYPE_STATUS,
                NOTION_DATA_TYPE_URL,
                NOTION_DATA_TYPE_LAST_EDITED_TIME,
                NOTION_DATA_TYPE_CREATED_TIME
              ].includes( propertyType )) {

                propdata[propertyKey] = {
                  [DGMD_TYPE]: propertyType,
                  [DGMD_VALUE]: null
                };

              };
            }
          }
        }
      }
      return somedata;
    } );
    return data;
  }
  return {};
};


const getNotionDbasePromise = (nClient, allPages, relMap, collector, queryObj) => {
  const p = new Promise((resolve, reject) => {

    nClient.databases.query( queryObj )
      .then( result => {
        const properties = getNotionDbaseProperties( result, relMap );
        collector[QUERY_PROPERTIES].push( ...properties );

        const has_more = result[NOTION_HAS_MORE];
        const next_cursor = result[NOTION_NEXT_CURSOR];

        if (allPages) {
          const cursors = collector[QUERY_PAGES][NOTION_NEXT_CURSOR];
          if (cursors.length === 0 && next_cursor === null) {
            collector[QUERY_PAGES][NOTION_NEXT_CURSOR] = null;
          }
          else {
            cursors.push( next_cursor );
          }
        }
        else {
          collector[QUERY_PAGES][NOTION_HAS_MORE] = has_more;
          collector[QUERY_PAGES][NOTION_NEXT_CURSOR] = next_cursor;
        }
        const next = allPages ? next_cursor : null;
        resolve( {
          [NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR]:collector, 
          [NOTION_WRANGLE_LOCAL_NDBP_NEXT]: next
        } );
      })
      .catch( error => {
        reject( error );
      });
  });
  return p;
};

const chainNotionDbasePromises = 
  (nClient, dbId, allPages, relMap, startCursor, proceed, collector ) => {
  
  if (proceed) {
    const queryObj = {
      [NOTION_KEY_DATABASE_ID]: dbId
    };
    if (startCursor) {
      queryObj[NOTION_KEY_START_CURSOR] = startCursor;
    }

    return getNotionDbasePromise( nClient, allPages, relMap, collector, queryObj )
    .then( obj => {

      const collector = obj[NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR];
      const next = obj[NOTION_WRANGLE_LOCAL_NDBP_NEXT];
      const nextProceed = next !== null;

      return chainNotionDbasePromises(
        nClient, dbId, allPages, relMap, next, nextProceed, collector );

    });
  }
  else {
    return Promise.resolve( collector );
  }
};

const getNotionDbase = ( nClient, meta, dbId, relMap ) => {
  const initStartCursorType = meta[DATABASE_QUERY_PAGE_CURSOR_TYPE];
  const specificPage = initStartCursorType === PAGE_CURSOR_TYPE_SPECIFIC;
  const allPages = initStartCursorType === PAGE_CURSOR_TYPE_ALL;
  const initStartCursor =
    specificPage ? meta[DATABASE_QUERY_PAGE_CURSOR_ID] : null;
  const collector = {
    [QUERY_PROPERTIES]: [],
    [QUERY_PAGES]: {
      [NOTION_HAS_MORE]: false,
      [NOTION_NEXT_CURSOR]: allPages ? [] : null
    }
  };

  return chainNotionDbasePromises( 
    nClient, dbId, allPages, relMap, initStartCursor, true, collector );
};

const getNotionBlockKeyedDatabases = (blockDatas, collector) => {
  if (NOTION_RESULTS in blockDatas) {
    const somedata = blockDatas[NOTION_RESULTS].reduce( (acc, cur) => {
      const propertyType = cur[NOTION_KEY_TYPE];
      const propertyVal = cur[propertyType];
      const gotPropertyVal = propertyVal !== null && propertyVal !== undefined;
      const id = cur[NOTION_KEY_ID];
      const idSansHyphens = removeHyphens( id );

      if (gotPropertyVal) {
        const propertyValTitle = propertyVal[NOTION_DATA_TYPE_TITLE];
        if (propertyType === NOTION_DATA_TYPE_CHILD_DATABASE) {
          const obj = {
            [DGMD_PAGE_DATA]: idSansHyphens,
            [DGMD_VALUE]: propertyValTitle
          };
          acc[NOTION_RESULT_BLOCK_DBS].push( obj );
        }
        else if (
          propertyType === NOTION_DATA_TYPE_COLUMN_LIST ||
          propertyType === NOTION_DATA_TYPE_COLUMN) {
          acc[NOTION_RESULT_COLUMN_LISTS].push( idSansHyphens );
        }
        else if (
          propertyType === 'heading_3' ||
          propertyType === 'heading_2' ||
          propertyType === 'heading_1' ||
          propertyType === 'paragraph' ||
          propertyType === 'to_do' ||
          propertyType === 'bulleted_list_item' ||
          propertyType === 'divider' ||
          propertyType === 'quote' ||
          propertyType === 'toggle' ||
          propertyType === 'child_page'
        ) {
        }
        else {
          // console.log( 'what is it?', propertyType, propertyVal );
        }   
      }

      return acc;
    }, collector );
    return somedata;
  }
  return collector;
};

const getCover = cover => {
  let coverVal = null;
  let coverType = null;
  if (cover) {
    coverType = cover.type;
    if (coverType === NOTION_DATA_TYPE_EXTERNAL) {
      coverVal = cover.external.url;
    }
    else if (coverType === NOTION_DATA_TYPE_FILE) {
      coverVal = cover.file.url;
    }
  }
  return {
    type: coverType,
    value: coverVal
  };
};

const getIcon = icon => {
  let iconVal = null;
  let iconType = null;
  if (icon) {
    iconType = icon.type;
    if (iconType === NOTION_DATA_TYPE_EMOJI) {
      iconVal = icon.emoji;
    }
    else if (iconType === NOTION_DATA_TYPE_EXTERNAL) {
      iconVal = icon.external.url;
    }
  }
  return {
    type: iconType,
    value: iconVal
  };
};

const getNotionPageBlockPromise = async(nClient, blockId, collector) => {
  const p = new Promise((resolve, reject) => {
    nClient.blocks.children.list( { 
      block_id: blockId,
      page_size: 50
    } )
    .then( result => {
      const keyedDatabases = getNotionBlockKeyedDatabases( result, collector );

      resolve( {
        [NOTION_RESULT_BLOCK_KEY]: blockId,
        [NOTION_RESULT_BLOCK_DBS]: keyedDatabases[NOTION_RESULT_BLOCK_DBS],
        [NOTION_RESULT_COLUMN_LISTS]: keyedDatabases[NOTION_RESULT_COLUMN_LISTS]
      } );
    })
    .catch( error => {
      reject(error);
    });
  });
  let results = await p;
  const clList = results[NOTION_RESULT_COLUMN_LISTS];
  for (var clListIdx = clList.length-1; clListIdx >= 0; clListIdx--) {
    const cListItemId = clList[clListIdx];
    clList.splice( clListIdx, 1 );
    getNotionPageBlockPromise( nClient, cListItemId, collector );
  }

  return p;
};

const deriveBoolean = ( value ) => {
  const str = String( value );
  const strLowTrim = str.toLowerCase().trim();
  return [
    'true',
    '1',
    'yes',
    'y',
    'on'
  ].includes( strLowTrim );
};


const getDbMeta = (primary, dbId, dbPgCursor) => {
  const obj = {
    [DATABASE_QUERY_PRIMARY]: primary,
    [DATABASE_QUERY_ID]: dbId,
    [DATABASE_QUERY_TITLE]: undefined,
    [DATABASE_QUERY_PARENT_ID]: undefined,
    [DATABASE_QUERY_PARENT_TITLE]: undefined,
    [DATABASE_QUERY_PARENT_TYPE]: undefined,
    [DATABASE_QUERY_COVER]: undefined,
    [DATABASE_QUERY_ICON]: undefined
  };
  if (dbPgCursor) {
    obj[DATABASE_QUERY_PAGE_CURSOR_TYPE] = dbPgCursor[PAGE_CURSOR_TYPE_REQUEST];
    obj[DATABASE_QUERY_PAGE_CURSOR_ID] = dbPgCursor[PAGE_CURSOR_ID_REQUEST];
  }
  return obj;
};

const notionUpdateDbMeta = async(nClient, nDbase, meta) => {
  try {
    const primaryTitle = getNotionDbaseTitle( nDbase );
    meta[DATABASE_QUERY_TITLE] = primaryTitle;
    const primaryCover = getCover( nDbase[NOTION_DATA_TYPE_COVER] );
    meta[DATABASE_QUERY_COVER] = primaryCover[NOTION_KEY_VALUE];
    const primaryIcon = getIcon( nDbase[NOTION_DATA_TYPE_ICON] );
    meta[DATABASE_QUERY_ICON] = primaryIcon[NOTION_KEY_VALUE];
    const [primaryParentId, primaryParentType] = getNotionDbaseParentId( nDbase );
    meta[DATABASE_QUERY_PARENT_ID] = primaryParentId;
    if (primaryParentType === NOTION_KEY_PAGE_ID) {
      const primaryPageParent = await nClient.pages.retrieve({ [NOTION_KEY_PAGE_ID]: primaryParentId });
      const primaryPageParentTitle = getNotionPageTitle( primaryPageParent );
      meta[DATABASE_QUERY_PARENT_TITLE] = primaryPageParentTitle;
      meta[DATABASE_QUERY_PARENT_TYPE] = primaryParentType;
    }
  }
  catch (e) {
    console.log( 'primary meta collection error', e );
  }
};

const loadBlocks = async ( nClient, allDbResults ) => {
  const notionPagePromises = [];
  allDbResults.forEach( dbResult => {
    const qProps = dbResult[QUERY_PROPERTIES];
    qProps.forEach( qProp => {
      const qPropId = qProp[DGMD_METADATA][DGMDCC_ID][DGMD_VALUE];
      const blocksCollector = {
        [NOTION_RESULT_BLOCK_DBS]: [],
        [NOTION_RESULT_COLUMN_LISTS]: []
      };
      const blocksResult = getNotionPageBlockPromise( nClient, qPropId, blocksCollector );
      notionPagePromises.push( blocksResult );
    });
  });
  const notionBlockResults = await Promise.all( notionPagePromises );
  const notionBlockResultsIndexed = notionBlockResults.reduce((result, item) => {
    if (NOTION_RESULT_BLOCK_KEY in item && NOTION_RESULT_BLOCK_DBS in item) {
      result.push( {
        [NOTION_RESULT_BLOCK_KEY]: item[NOTION_RESULT_BLOCK_KEY],
        [NOTION_RESULT_BLOCK_DBS]: item[NOTION_RESULT_BLOCK_DBS]
      } );
    }
    return result;
  }, [] );
  
  return notionBlockResultsIndexed;
};


const convertDateFromNotionToDGMD = dateObj => {
  const startDate = dateObj[NOTION_KEY_START_DATE];
  const endDate = dateObj[NOTION_KEY_END_DATE];
  const timeZone = dateObj[NOTION_KEY_TIME_ZONE];
  return {
    [DGMD_START_DATE]: startDate,
    [DGMD_END_DATE]: endDate,
    [DGMD_TIME_ZONE]: timeZone
  };
};
import {
  NextResponse
} from 'next/server';

import {
  Client
} from "@notionhq/client";

import {
  removeHyphens
} from '../../../utils/strings.js';

import {
  EXPORT_DATA_KEY,
  EXPORT_DATA_METADATA,
  EXPORT_DATA_PROPERTIES,
  EXPORT_DATA_TYPE,
  EXPORT_DATA_VALUE,
  NOTION_RESULT,
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_BLOCK_DBS,
  NOTION_RESULT_COLUMN_LISTS,
  NOTION_RESULT_PAGE_DATA,
  NOTION_RESULT_BLOCK_KEY,
  NOTION_RESULT_DATABASE_ID,
  NOTION_RESULT_PARENT_ID,
  NOTION_RESULT_PARENT_TITLE,
  NOTION_RESULT_PARENT_TYPE,
  NOTION_RESULT_DATABASE_TITLE,
  NOTION_RESULT_ERROR,
  NOTION_RESULT_ICON,
  NOTION_RESULT_COVER,
  NOTION_RESULT_PRIMARY_DATABASE,
  NOTION_RESULT_RELATION_BLOCK_ID,
  NOTION_RESULT_RELATION_PAGE_ID,
  NOTION_RESULT_RELATION_DATABASES,
  NOTION_RESULT_RELATION_DATABASE_ID,
  NOTION_RESULT_SUCCESS,
  URL_SEARCH_PARAM_BLOCKS_REQUEST,
  URL_SEARCH_PARAM_DATABASE,
  // URL_SEARCH_PARAM_RELATIONS_REQUEST,
  URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST
} from './keys.js';

import {
  getApiCoriHeaders
} from '../../../utils/coriHeaders.js';

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
const NOTION_DATA_TYPE_FILE = 'file';
const NOTION_DATA_TYPE_TITLE = 'title';
const NOTION_DATA_TYPE_RICH_TEXT = 'rich_text';
const NOTION_DATA_TYPE_CHECKBOX = 'checkbox';
const NOTION_DATA_TYPE_EMAIL = 'email';
const NOTION_DATA_TYPE_STATUS = 'status';
const NOTION_DATA_TYPE_RELATION = 'relation';
const NOTION_DATA_TYPE_CHILD_DATABASE = 'child_database';
const NOTION_DATA_TYPE_COLUMN_LIST = 'column_list';
const NOTION_DATA_TYPE_COLUMN = 'column';
const NOTION_DATA_TYPE_BLOCK = 'block';
const NOTION_DATA_TYPE_PHONE_NUMBER = 'phone_number';
const NOTION_DATA_TYPE_FORMULA = 'formula';
const NOTION_DATA_TYPE_URL = 'url';
const NOTION_DATA_TYPE_DATE = 'date';
const NOTION_DATA_LAST_EDITED_TIME = 'last_edited_time';
const NOTION_DATA_CREATED_TIME = 'created_time';
const NOTION_DATA_TYPE_ICON = 'icon';
const NOTION_DATA_TYPE_COVER = 'cover';
const NOTION_DATA_TYPE_EMOJI = 'emoji';
const NOTION_DATA_TYPE_EXTERNAL = 'external';

const NOTION_KEY_NAME = 'name';
const NOTION_KEY_FILE = 'file';
const NOTION_KEY_URL = 'url';
const NOTION_KEY_EXTERNAL = 'external';
const NOTION_KEY_PLAIN_TEXT = 'plain_text';
const NOTION_KEY_DATABASE_ID = 'database_id';
const NOTION_KEY_ID = 'id';

const NOTION_HAS_MORE = 'has_more';
const NOTION_NEXT_CURSOR = 'next_cursor';

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

const QUERY_META = 'QUERY_META';
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
  if (params.has(URL_SEARCH_PARAM_DATABASE)) {
    const dbId = params.get(URL_SEARCH_PARAM_DATABASE);
    requests[DATABASE_ID_REQUEST] = dbId;
  }
  if (params.has(URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST)) {
    const pcs = params.get(URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST);
    requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_TYPE_REQUEST] = pcs;
  }
  if (params.has(URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST)) {
    const pcid = params.get(URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST);
    requests[PAGE_CURSOR_REQUEST][PAGE_CURSOR_ID_REQUEST] = pcid;
  }
  if (params.has(URL_SEARCH_PARAM_BLOCKS_REQUEST)) {
    const blocks = params.get(URL_SEARCH_PARAM_BLOCKS_REQUEST);
    requests[BLOCKS_REQUEST] = stringToBoolean(blocks);
  }
  try {

    const nClient = new Client({ 
      auth: secrets[SECRET_ID]
    });

    const primaryDbId = requests[DATABASE_ID_REQUEST];
    const x = await getNotionDbaseRelationsIds( nClient, primaryDbId );
    const relMap = x['relMap'];
    const dbMap = x['dbMap'];

    const metasMap = new Map();
    for (const [dbId, db] of dbMap.entries()) {
      const primary = dbId === primaryDbId;
      const pageReq = primary ? requests[PAGE_CURSOR_REQUEST] : PAGE_CURSOR_TYPE_ALL;
      const meta = getDbMeta( primary, dbId, pageReq );
      notionUpdateDbMeta( nClient, db, meta );
      metasMap.set( dbId, meta );
    }
    const primaryMeta = metasMap.get( primaryDbId );
    const nDbResult = await getNotionDbase( 
      nClient, primaryMeta, primaryDbId, relMap.get(primaryDbId) );

    const qProps = nDbResult[QUERY_PROPERTIES];
    const qPages = nDbResult[QUERY_PAGES];
    const qId = primaryMeta[DATABASE_QUERY_ID];
    const qTitle = primaryMeta[DATABASE_QUERY_TITLE];
    const qParentTitle = primaryMeta[DATABASE_QUERY_PARENT_TITLE];
    const qParentId = primaryMeta[DATABASE_QUERY_PARENT_ID];
    const qParentType = primaryMeta[DATABASE_QUERY_PARENT_TYPE];
    const qIcon = primaryMeta[DATABASE_QUERY_ICON];
    const qCover = primaryMeta[DATABASE_QUERY_COVER];

    const unloadedPageIds = new Map();
    const loadedPageIds = new Set();

    const xx = await loadRelatedDbs( nClient, relMap, qProps, unloadedPageIds, loadedPageIds );
    console.log( 'xx', xx );

    // while( unloadedPageIds.length > 0 ) {
    //   const pageId = unloadedPageIds.shift();
    //   const response = await nClient.pages.retrieve({ 
    //     page_id: pageId
    //   });
    // }

    // for (const qProp of qProps) {
    //   const qqProps = qProp[EXPORT_DATA_PROPERTIES];
    //   for (const [qPropKey, qPropObj] of Object.entries(qqProps)) {
    //     if (qPropObj[EXPORT_DATA_TYPE] === NOTION_DATA_TYPE_RELATION) {
    //       const qPropValues = qPropObj[EXPORT_DATA_VALUE];
    //       for (const qPropValue of qPropValues) {
    //         const dbId = qPropValue[NOTION_RESULT_RELATION_DATABASE_ID];
    //         if (dbId !== primaryDbId) {
    //           const pageId = qPropValue[NOTION_RESULT_RELATION_PAGE_ID];
    //           const response = await nClient.pages.retrieve({ 
    //             page_id: '1c0df1bc911242faacea7d73fbc2ec0f'
    //           });
    //           console.log( 'response', response['properties']['Question']['rich_text'] );
    //           console.log( '' );
    //         }
    //       }
    //     }
    //   }
    // }

    const dbResult = {
      //todo -- this should be "pages"
      [NOTION_RESULT_BLOCKS]: qProps,
      [NOTION_RESULT_PAGE_DATA]: qPages,
      [NOTION_RESULT_DATABASE_ID]: qId,
      [NOTION_RESULT_DATABASE_TITLE]: qTitle,
      [NOTION_RESULT_PARENT_ID]: qParentId,
      [NOTION_RESULT_PARENT_TITLE]: qParentTitle,
      [NOTION_RESULT_PARENT_TYPE]: qParentType,
      [NOTION_RESULT_ICON]: qIcon,
      [NOTION_RESULT_COVER]: qCover,
    };
    const orgDbResult = {
      [NOTION_RESULT_PRIMARY_DATABASE]: dbResult,
      [NOTION_RESULT_RELATION_DATABASES]: []
    };

    // if (requests[BLOCKS_REQUEST]) {
    //   const notionPagePromises = [];
    //   allDbResults.forEach( dbResult => {
    //     const qProps = dbResult[QUERY_PROPERTIES];
    //     qProps.forEach( qProp => {
    //       const qPropId = qProp[EXPORT_DATA_METADATA][DGMDCC_ID][EXPORT_DATA_VALUE];
    //       const blocksCollector = {
    //         [NOTION_RESULT_BLOCK_DBS]: [],
    //         [NOTION_RESULT_COLUMN_LISTS]: []
    //       };
    //       const blocksResult = getNotionPageBlockPromise( nClient, qPropId, blocksCollector );
    //       notionPagePromises.push( blocksResult );
    //     });
    //   });
    //   const notionBlockResults = await Promise.all( notionPagePromises );
    //   const notionBlockResultsIndexed = notionBlockResults.reduce((result, item) => {
    //     if (NOTION_RESULT_BLOCK_KEY in item && NOTION_RESULT_BLOCK_DBS in item) {
    //       result.push( {
    //         [NOTION_RESULT_BLOCK_KEY]: item[NOTION_RESULT_BLOCK_KEY],
    //         [NOTION_RESULT_BLOCK_DBS]: item[NOTION_RESULT_BLOCK_DBS]
    //       } );
    //     }
    //     return result;
    //   }, [] );
      
    //   orgDbResults[NOTION_RESULT_BLOCKS] = notionBlockResultsIndexed;
    // }

    return createResponse( {
      [NOTION_RESULT_SUCCESS]: true,
      [NOTION_RESULT]: orgDbResult
    }, request );

  }
  catch ( e ) {
    console.log( e );
    return createResponse( {
      [NOTION_RESULT_SUCCESS]: false,
      [NOTION_RESULT_ERROR]: 'invalid credentials'
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

const trackLoadedPages =
  (qProps: any[], unloadedPageIds: Map<any, Set<any>>, loadedPageIds: Set<any>) => {

  for (const cur of qProps) {
    const meta = cur[EXPORT_DATA_METADATA];
    const pageId = meta[DGMDCC_ID][EXPORT_DATA_VALUE];
    loadedPageIds.add(pageId);
    const props = cur[EXPORT_DATA_PROPERTIES];
    const propKeys = Object.keys(props);
    for (const propKey of propKeys) {
      const prop = props[propKey];
      if (NOTION_DATA_TYPE_RELATION === prop[EXPORT_DATA_TYPE]) {
        const propVals = prop[EXPORT_DATA_VALUE];
        for (const propValObj of propVals) {
          const propRelPgId = propValObj[NOTION_RESULT_RELATION_PAGE_ID];
          const propRelDbId = propValObj[NOTION_RESULT_RELATION_DATABASE_ID];
          if (!loadedPageIds.has(propRelDbId)) {
            unloadedPageIds.set(propRelDbId, new Set());
          }
          const unloadedSet = unloadedPageIds.get(propRelDbId);
          if (!loadedPageIds.has(propRelPgId)) {
            unloadedSet.add(propRelPgId);
          }
        }
      }
    }
  }
};

const chainLoadRelatedDbs = async (nClient, relMap, unloadedPageIds, loadedPageIds ) => {
  const anyLeft = !areAllMapSetsEmpty( unloadedPageIds );
  if (anyLeft) {
    for (const [dbId, unloadedSet] of unloadedPageIds) {
      for (const unloadedPageId of unloadedSet) {
        if (loadedPageIds.has(unloadedPageId)) {
          unloadedSet.delete(unloadedPageId);
        }
      }
      let pageCursorId = null;
      const unloadedList = [...unloadedSet.keys()];
      for (const unloadedPageId of unloadedList) {
        let foundPg = false;
        let allPgsChecked = false;
        while( !foundPg && !allPgsChecked ) {
          const meta = {
            [DATABASE_QUERY_PAGE_CURSOR_TYPE]: PAGE_CURSOR_TYPE_SPECIFIC,
            [DATABASE_QUERY_PAGE_CURSOR_ID]: pageCursorId
          };
          const db = await getNotionDbase( nClient, meta, dbId, relMap.get(dbId) );
          const dbProps = db[QUERY_PROPERTIES];
          
          trackLoadedPages( dbProps, unloadedPageIds, loadedPageIds );

          const pg = dbProps.find( p => 
            unloadedPageId === p[EXPORT_DATA_METADATA][DGMDCC_ID][EXPORT_DATA_VALUE]
          );

          if (pg) {
            foundPg = true;
            unloadedSet.delete(unloadedPageId);
            loadedPageIds.add(unloadedPageId);
            console.log( 'foundPg', unloadedPageId );
          }
          else {
            pageCursorId = db[QUERY_PAGES][NOTION_NEXT_CURSOR];
            allPgsChecked = pageCursorId === null;
            if (allPgsChecked) {
              unloadedSet.delete(unloadedPageId);
              loadedPageIds.add(unloadedPageId);
              console.log( 'allPgsChecked', allPgsChecked );
            }
          }
        }
      }
    }
    return chainLoadRelatedDbs( nClient, relMap, unloadedPageIds, loadedPageIds );
  }
  else {
    return Promise.resolve();
  }
};

const loadRelatedDbs = async(nClient, relMap, dbProps, unloadedPageIds, loadedPageIds) => {
  trackLoadedPages( dbProps, unloadedPageIds, loadedPageIds );
  return chainLoadRelatedDbs( nClient, relMap, unloadedPageIds, loadedPageIds );
};

const getNotionDbaseRelationPromise = async (nClient, dbId, collector) => {
  const db = await nClient.databases.retrieve({
    [NOTION_KEY_DATABASE_ID]: dbId
  });

  const dbMap = collector['dbMap'];
  const relMap = collector['relMap'];
  dbMap.set( dbId, db );

  const nextDbIds = new Set();

  const ndbProperties = db[NOTION_PROPERTIES];
  const ndbPropertiesKeys = Object.keys( ndbProperties );
  for (const ndbPropertiesKey of ndbPropertiesKeys) {
    //ndbPropertiesKey is the dbase property title
    const ndpPropertyVal = ndbProperties[ndbPropertiesKey];
    const ndpPropertyType = ndpPropertyVal[NOTION_DATA_TYPE];
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
  return {
    collector,
    nextDbIds
  };
};

const chainNotionDbaseRelationIds = async (nClient, dbId, collector) => {
  const obj = await getNotionDbaseRelationPromise(nClient, dbId, collector);
  const nextDbIds = Array.from(obj['nextDbIds'].keys());
  for (const nextDbId of nextDbIds) {
    if (!collector['dbMap'].has(nextDbId)) {
      await chainNotionDbaseRelationIds(
        nClient, nextDbId, collector);
    }
  }
  return Promise.resolve(collector);
};

const getNotionDbaseRelationsIds = ( nClient, dbId ) => {
  const collector = {
    'relMap': new Map(),
    'dbMap': new Map()
  };
  return chainNotionDbaseRelationIds( nClient, dbId, collector );
};

//all of this nonsense because title is not in the typescript
//https://github.com/makenotion/notion-sdk-js/issues/471
const getNotionDbaseTitle = notionDbases => {
  for (const [key, value] of Object.entries(notionDbases)) {
    if (key === 'title') {
      return value[0].plain_text;
    }
  }
};

const getNotionDbaseParentId = nDatabase => {
  for (const [key, value] of Object.entries(nDatabase)) {
    if (key === 'parent') {
      const parentType = value['type'];
      const parentId = removeHyphens( value[parentType] );
      return [parentId, parentType]
    }
  }
};

const getNotionPageTitle = nPage => {
  const props = nPage.properties;
  for (const [key, value] of Object.entries(props)) {
    if (value['type'] === 'title') {
      const title = value['title'][0]['plain_text'];
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
        [EXPORT_DATA_METADATA]: metadata,
        [EXPORT_DATA_PROPERTIES]: propdata
      };
      const keys = Object.keys( resultData );
      for (const key of keys) {
        if (key === NOTION_ID) {

          const id = resultData[key];
          const idSansHyphens = removeHyphens( id );

          metadata[DGMDCC_ID] = {
            [EXPORT_DATA_TYPE]: DGMDCC_ID,
            [EXPORT_DATA_VALUE]: idSansHyphens
          };
        }
        else if (key === NOTION_URL) {
          metadata[DGMDCC_URL] = {
            [EXPORT_DATA_TYPE]: DGMDCC_URL,
            [EXPORT_DATA_VALUE]: resultData[key]
          };
        }
        else if (key === NOTION_DATA_TYPE_ICON) {
          const iconObj = getIcon( resultData[key] );
          metadata[NOTION_DATA_TYPE_ICON] = {
            [EXPORT_DATA_TYPE]: iconObj['type'],
            [EXPORT_DATA_VALUE]: iconObj['value']
          };
        }
        else if (key === NOTION_DATA_TYPE_COVER) {
          const coverObj = getCover( resultData[key] );
          metadata[NOTION_DATA_TYPE_COVER] = {
            [EXPORT_DATA_TYPE]: coverObj['type'],
            [EXPORT_DATA_VALUE]: coverObj['value']
          };
        }
        else if (key === NOTION_PROPERTIES) {
          const properties = resultData[key];
          const propertyKeys = Object.keys( properties );
          for (const propertyKey of propertyKeys) {

            const propertyObj = properties[propertyKey];
            const propertyType = propertyObj[NOTION_DATA_TYPE];
            const propertyVal = propertyObj[propertyType];
            const gotPropertyVal = propertyVal !== null && propertyVal !== undefined;

            if (gotPropertyVal) {
              if (propertyType === NOTION_DATA_TYPE_SELECT) {

                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_SELECT,
                  [EXPORT_DATA_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_MULTI_SELECT) {
                
                const multis = propertyVal.map( m => m[NOTION_KEY_NAME] );
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_MULTI_SELECT,
                  [EXPORT_DATA_VALUE]: multis
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
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_FILES,
                  [EXPORT_DATA_VALUE]: file
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_NUMBER) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_NUMBER,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_CHECKBOX) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_CHECKBOX,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_URL) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_URL,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_EMAIL) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_EMAIL,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_PHONE_NUMBER) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_PHONE_NUMBER,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_STATUS) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_STATUS,
                  [EXPORT_DATA_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_TITLE || propertyType == NOTION_DATA_TYPE_RICH_TEXT) {
                const titles = propertyVal.map( m => m[NOTION_KEY_PLAIN_TEXT] );
                const val = titles.length > 0 ? titles.join('') : null;

                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_RELATION) {
                const notionPropertyId = propertyObj[NOTION_KEY_ID];
                const dbId = relMap.get( notionPropertyId );
                const val = propertyVal.map( m => {
                  return {
                    [NOTION_RESULT_RELATION_DATABASE_ID]: dbId,
                    [NOTION_RESULT_RELATION_PAGE_ID]: removeHyphens( m[NOTION_KEY_ID] )
                  } }
                );
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_DATE) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_LAST_EDITED_TIME) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_CREATED_TIME) {
                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
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
                NOTION_DATA_LAST_EDITED_TIME,
                NOTION_DATA_CREATED_TIME
              ].includes( propertyType )) {

                propdata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: null
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

const KEY_NDBP_COLLECTOR = 'KEY_NDBP_COLLECTOR';
const KEY_NDBP_NEXT = 'KEY_NDBP_NEXT';
const getNotionDbasePromise = (nClient, allPages, relMap, collector, queryObj) => {
  const p = new Promise((resolve, reject) => {

    nClient.databases.query( queryObj )
      .then( result => {
        const properties = getNotionDbaseProperties( result, relMap );
        collector[QUERY_PROPERTIES].push( ...properties );

        const has_more = result[NOTION_HAS_MORE];
        const next_cursor = result[NOTION_NEXT_CURSOR];

        if (allPages) {
          collector[QUERY_PAGES][NOTION_NEXT_CURSOR].push( next_cursor );
        }
        else {
          collector[QUERY_PAGES][NOTION_HAS_MORE] = has_more;
          collector[QUERY_PAGES][NOTION_NEXT_CURSOR] = next_cursor;
        }
        const next = allPages ? next_cursor : null;
        resolve( {
          [KEY_NDBP_COLLECTOR]:collector, 
          [KEY_NDBP_NEXT]: next
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
  
  console.log( 'chainNotionDbasePromises', dbId, startCursor, proceed );

  if (proceed) {
    const queryObj = {
      [NOTION_KEY_DATABASE_ID]: dbId
    };
    if (startCursor) {
      queryObj['start_cursor'] = startCursor;
    }

    return getNotionDbasePromise( nClient, allPages, relMap, collector, queryObj )
    .then( obj => {

      const collector = obj[KEY_NDBP_COLLECTOR];
      const next = obj[KEY_NDBP_NEXT];
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
      const propertyType = cur[NOTION_DATA_TYPE];
      const propertyVal = cur[propertyType];
      const gotPropertyVal = propertyVal !== null && propertyVal !== undefined;
      const id = cur[NOTION_KEY_ID];
      const idSansHyphens = removeHyphens( id );

      if (gotPropertyVal) {
        const propertyValTitle = propertyVal[NOTION_DATA_TYPE_TITLE];
        if (propertyType === NOTION_DATA_TYPE_CHILD_DATABASE) {
          const obj = {
            [EXPORT_DATA_KEY]: idSansHyphens,
            [EXPORT_DATA_VALUE]: propertyValTitle
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

function stringToBoolean(str) {
  if (typeof str !== 'string') {
    // If the input is not a string, return false or handle it as needed
    return false;
  }

  str = str.toLowerCase().trim();

  return str === 'true' || str === '1' || str === 'yes' || str === 'y' || str === 'on';
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
    meta[DATABASE_QUERY_COVER] = primaryCover['value'];
    const primaryIcon = getIcon( nDbase[NOTION_DATA_TYPE_ICON] );
    meta[DATABASE_QUERY_ICON] = primaryIcon['value'];
    const [primaryParentId, primaryParentType] = getNotionDbaseParentId( nDbase );
    meta[DATABASE_QUERY_PARENT_ID] = primaryParentId;
    if (primaryParentType === 'page_id') {
      const primaryPageParent = await nClient.pages.retrieve({ page_id: primaryParentId });
      const primaryPageParentTitle = getNotionPageTitle( primaryPageParent );
      meta[DATABASE_QUERY_PARENT_TITLE] = primaryPageParentTitle;
      meta[DATABASE_QUERY_PARENT_TYPE] = primaryParentType;
    }
  }
  catch (e) {
    console.log( 'primary meta collection error', e );
  }
};

//
//  UTILS
//
const areAllMapSetsEmpty = unloadedPgIds => {
  // Iterate over the Map entries
  for (const set of unloadedPgIds.values()) {
    // Check if the Set is not empty
    if (set.size > 0) {
      return false; // If any set is not empty, return false
    }
  }
  // If all sets are empty, return true
  return true;
}
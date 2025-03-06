import {
  areAllMapSetsEmpty
} from '@/utils/lists.js';
import {
  removeHyphens
} from '@/utils/utils.js';
import {
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_CHECKBOX,
  DGMD_BLOCK_TYPE_COVER,
  DGMD_BLOCK_TYPE_CREATED_TIME,
  DGMD_BLOCK_TYPE_DATE,
  DGMD_BLOCK_TYPE_EMAIL,
  DGMD_BLOCK_TYPE_FILE_EXTERNAL,
  DGMD_BLOCK_TYPE_FORMULA_BOOLEAN,
  DGMD_BLOCK_TYPE_FORMULA_DATE,
  DGMD_BLOCK_TYPE_FORMULA_STRING,
  DGMD_BLOCK_TYPE_ICON,
  DGMD_BLOCK_TYPE_ID,
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
  DGMD_CURSOR_DATA,
  DGMD_CURSOR_HAS_MORE,
  DGMD_CURSOR_NEXT,
  DGMD_DATABASE_DESCRIPTION,
  DGMD_DATABASE_ID,
  DGMD_DATABASE_TITLE,
  DGMD_END_DATE,
  DGMD_INCLUDE_RELATION_DATABASES,
  DGMD_METADATA,
  DGMD_PARENT_ID,
  DGMD_PARENT_TITLE,
  DGMD_PARENT_TYPE,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASES,
  DGMD_RELATION_DATABASE_ID,
  DGMD_RELATION_PAGE_ID,
  DGMD_START_DATE,
  DGMD_TIME_ZONE,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';

import {
  NOTION_CURSOR_HAS_MORE,
  NOTION_CURSOR_NEXT,
  NOTION_DATA_TYPE_CHECKBOX,
  NOTION_DATA_TYPE_COVER,
  NOTION_DATA_TYPE_CREATED_TIME,
  NOTION_DATA_TYPE_DATE,
  NOTION_DATA_TYPE_DESCRIPTION,
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
  NOTION_FORMULA_RESULT_BOOLEAN,
  NOTION_FORMULA_RESULT_DATE,
  NOTION_FORMULA_RESULT_STRING,
  NOTION_KEY_DBS,
  NOTION_KEY_DB_ID,
  NOTION_KEY_END_DATE,
  NOTION_KEY_EXTERNAL,
  NOTION_KEY_FILE,
  NOTION_KEY_ID,
  NOTION_KEY_NAME,
  NOTION_KEY_PAGES,
  NOTION_KEY_PAGE_ID,
  NOTION_KEY_PARENT,
  NOTION_KEY_PLAIN_TEXT,
  NOTION_KEY_START_CURSOR,
  NOTION_KEY_START_DATE,
  NOTION_KEY_TIME_ZONE,
  NOTION_KEY_TYPE,
  NOTION_KEY_URL,
  NOTION_KEY_VALUE,
  NOTION_PROPERTIES,
  NOTION_RESULTS
} from './notionConstants.js';
import {
  NOTION_WRANGLE_KEY_DATA_DB_MAP,
  NOTION_WRANGLE_KEY_RELATIONS_MAP,
} from './notionWranglerConstants.js';

export const DATABASE_QUERY_DATABASE_ID_REQUEST = 'DATABASE_ID_REQUEST';
export const DATABASE_QUERY_PAGE_CURSOR_REQUEST = 'PAGE_CURSOR_REQUEST';
export const DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST = 'PAGE_CURSOR_TYPE_REQUEST';
export const DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST = 'PAGE_CURSOR_ID_REQUEST';
export const DATABASE_QUERY_PAGE_CURSOR_TYPE_DEFAULT = 'PAGE_CURSOR_TYPE_DEFAULT';
export const DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC = 'PAGE_CURSOR_TYPE_SPECIFIC';
export const DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL = 'PAGE_CURSOR_TYPE_ALL';
export const DATABASE_QUERY_PAGE_CURSOR_TYPE_NONE = 'PAGE_CURSOR_TYPE_NONE';
export const DATABASE_QUERY_INCLUDE_RELATIONSHIPS = 'INCLUDE_RELATIONSHIPS';
export const DATABASE_QUERY_RESULT_COUNT = 'DATABASE_QUERY_RESULT_COUNT';

const QUERY_PROPERTIES = 'QUERY_PROPERTIES';
const QUERY_PAGES = 'QUERY_PAGES';

const DATABASE_QUERY_PRIMARY = 'DATABASE_QUERY_PRIMARY';
const DATABASE_QUERY_ID = 'DATABASE_QUERY_ID';
const DATABASE_QUERY_TITLE = 'DATABASE_QUERY_TITLE';
const DATABASE_QUERY_DESCRIPTION = 'DATABASE_QUERY_DESCRIPTION';
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
const NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR = 'NOTION_WRANGLE_LOCAL_NDBP_COLLECTOR';
const NOTION_WRANGLE_LOCAL_NDBP_NEXT = 'NOTION_WRANGLE_LOCAL_NDBP_NEXT';

const NOTION_WRANGLE_RELATION_NEXT_CURSOR_ID = 'NOTION_WRANGLE_RELATION_NEXT_CURSOR_ID';

export const getNotionDatabases =
  async (nClient, requests) => {

  const incRels = requests[DATABASE_QUERY_INCLUDE_RELATIONSHIPS];

  const primaryDbId = requests[DATABASE_QUERY_DATABASE_ID_REQUEST];
  const x = await getNotionDbaseRelationsIds( nClient, primaryDbId, incRels );
  const dbMap = x[NOTION_WRANGLE_KEY_DATA_DB_MAP];
  const relMap = x[NOTION_WRANGLE_KEY_RELATIONS_MAP];

  const metasMap = new Map( );
  for (const [dbId, db] of dbMap.entries()) {
    const primary = dbId === primaryDbId;
    const pageReq = primary ? requests[DATABASE_QUERY_PAGE_CURSOR_REQUEST] : {
      [DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST]: DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL,
      [DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST]: null
    };
    const meta = getDbMeta( primary, dbId, pageReq );
    notionUpdateDbMeta( nClient, db, meta );
    metasMap.set( dbId, meta );
  }
  const nDbMeta = metasMap.get( primaryDbId );
  const nDbResult = await getNotionDbase( 
    nClient, nDbMeta, primaryDbId, relMap.get(primaryDbId) );
  const nDbProps = nDbResult[QUERY_PROPERTIES];

  const resultCount = requests[DATABASE_QUERY_RESULT_COUNT];
  const limitResultCount = resultCount !== Number.POSITIVE_INFINITY && nDbProps.length > resultCount;
  if (limitResultCount) {
    // Fisher-Yates shuffle
    for (let i = nDbProps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nDbProps[i], nDbProps[j]] = [nDbProps[j], nDbProps[i]];
    }
    nDbProps.length = resultCount;
  }
  const nDbPages = limitResultCount ? null : nDbResult[QUERY_PAGES];

  const loadedPageIds = new Map();
  const matchedPageIds = new Map();
  const dbPagination = new Map();

  if (incRels) {
    await loadRelatedDbases(
      nClient, relMap, primaryDbId, nDbProps,
      loadedPageIds, matchedPageIds, dbPagination );
  }

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
    // [DGMD_RELATION_DATABASES]: rDbResults
  };
  if (incRels) {
    orgDbResult[DGMD_RELATION_DATABASES] = rDbResults;
  }
  orgDbResult[DGMD_INCLUDE_RELATION_DATABASES] = incRels;

  return orgDbResult
};

//
//  todo -- filter results here to only return the relation items we need
//  or if the primary, just keep on crawling
//
const chainloadRelatedDbases = 
  async ( nClient, relMap, unloadedPageIds,
    loadedPageIds, dbTracker, dbPagination ) => {
  
  const anyLeft = !areAllMapSetsEmpty( unloadedPageIds );
  if (anyLeft) {
    for (const [dbId, unloadedSet] of unloadedPageIds) {
      if (!dbPagination.has(dbId)) {
        dbPagination.set( dbId, {
          [NOTION_WRANGLE_RELATION_NEXT_CURSOR_ID]: null
        } );
      }
      const dbPaginationObj = dbPagination.get( dbId );

      let pageCursorId = dbPaginationObj[NOTION_WRANGLE_RELATION_NEXT_CURSOR_ID];
      let keepSeaching = unloadedSet.size !== 0;
      while( keepSeaching ) {
        const meta = {
          [DATABASE_QUERY_PAGE_CURSOR_TYPE]: DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC,
          [DATABASE_QUERY_PAGE_CURSOR_ID]: pageCursorId
        };
        const db = await getNotionDbase(
          nClient, meta, dbId, relMap.get(dbId) );
        pageCursorId = db[QUERY_PAGES][NOTION_CURSOR_NEXT];
        dbPaginationObj[NOTION_WRANGLE_RELATION_NEXT_CURSOR_ID] = pageCursorId;

        const dbProps = db[QUERY_PROPERTIES];
        trackLoadedPages( dbId, dbProps, unloadedPageIds, loadedPageIds, dbTracker );

        const unloadedPagesSize = unloadedPageIds.get(dbId).size;

        //do it again if... we have more pages to load
        //or we have more result pages to load
        keepSeaching = unloadedPagesSize !== 0;
      }
    }
    return chainloadRelatedDbases( nClient, relMap, unloadedPageIds, loadedPageIds, dbTracker, dbPagination );
  }
  else {
    return Promise.resolve();
  }
};

const loadRelatedDbases =
  async( nClient, relMap, dbId, dbProps,
    loadedPageIds, dbTracker, dbPagination) => {
  const unloadedPageIds = new Map();
  trackLoadedPages( dbId, dbProps, unloadedPageIds, loadedPageIds, dbTracker );
  return chainloadRelatedDbases( nClient, relMap, unloadedPageIds, loadedPageIds, dbTracker, dbPagination );
};

const makeDbSerialized =
  (props, cursorData, meta) => {
  const s = {
    [DGMD_BLOCKS]: props,
    [DGMD_DATABASE_ID]: meta[DATABASE_QUERY_ID],
    [DGMD_DATABASE_TITLE]: meta[DATABASE_QUERY_TITLE],
    [DGMD_DATABASE_DESCRIPTION]: meta[DATABASE_QUERY_DESCRIPTION],
    [DGMD_PARENT_ID]: meta[DATABASE_QUERY_PARENT_ID],
    [DGMD_PARENT_TITLE]: meta[DATABASE_QUERY_PARENT_TITLE],
    [DGMD_PARENT_TYPE]: meta[DATABASE_QUERY_PARENT_TYPE],
    [DGMD_BLOCK_TYPE_ICON]: meta[DATABASE_QUERY_ICON],
    [DGMD_BLOCK_TYPE_COVER]: meta[DATABASE_QUERY_COVER],
  };
  if (!isNil(cursorData)) {
    s[DGMD_CURSOR_DATA] = {
      [DGMD_CURSOR_HAS_MORE]: cursorData[NOTION_CURSOR_HAS_MORE],
      [DGMD_CURSOR_NEXT]: cursorData[NOTION_CURSOR_NEXT]
    };
  }
  return s;
};

const trackLoadedPages =
  (dbId, propertyPages, unloadedPageIds, loadedPageIds, dbTracker) => {

  for (const page of propertyPages) {
    const meta = page[DGMD_METADATA];
    const pageId = meta[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
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
          const propRelPgId = propValObj[DGMD_RELATION_PAGE_ID];
          const propRelDbId = propValObj[DGMD_RELATION_DATABASE_ID];

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

const getNotionDbaseRelationPromise =
  async (nClient, dbId, collector) => {
  const db = await nClient[NOTION_KEY_DBS].retrieve({
    [NOTION_KEY_DB_ID]: dbId
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
      const dbaseId = relation[NOTION_KEY_DB_ID];
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

const chainNotionDbaseRelationIds =
  async (nClient, dbId, collector, collectRels) => {
  const nextDbIds = await getNotionDbaseRelationPromise(nClient, dbId, collector);
  if (collectRels) {
    for (const nextDbId of nextDbIds) {
      if (!collector[NOTION_WRANGLE_KEY_DATA_DB_MAP].has(nextDbId)) {
        await chainNotionDbaseRelationIds(
          nClient, nextDbId, collector, true);
      }
    }
  }
  return Promise.resolve(collector);
};

export const getNotionDbaseRelationsIds =
  ( nClient, dbId, includeRels ) => {
  const collector = {
    [NOTION_WRANGLE_KEY_RELATIONS_MAP]: new Map(),
    [NOTION_WRANGLE_KEY_DATA_DB_MAP]: new Map()
  };
  return chainNotionDbaseRelationIds( nClient, dbId, collector, includeRels );
};

//all of this nonsense because title is not in the typescript
//https://github.com/makenotion/notion-sdk-js/issues/471
export const getNotionDbaseTitle = nDatabase => {
  try {
    for (const [key, value] of Object.entries(nDatabase)) {
      if (key === NOTION_DATA_TYPE_TITLE) {
        return value[0][NOTION_KEY_PLAIN_TEXT];
      }
    }
  }
  catch( e ) {
    return '';
  }
};

export const getNotionDbaseDescription = nDatabase => {
  try {
    for (const [key, value] of Object.entries(nDatabase)) {
      if (key === NOTION_DATA_TYPE_DESCRIPTION) {
        return value[0][NOTION_KEY_PLAIN_TEXT];
      }
    }
  }
  catch (e) {
    return '';
  }
};

const getNotionDbaseParentId =
  nDatabase => {
  for (const [key, value] of Object.entries(nDatabase)) {
    if (key === NOTION_KEY_PARENT) {
      const parentType = value[NOTION_KEY_TYPE];
      const parentId = removeHyphens( value[parentType] );
      return [parentId, parentType]
    }
  }
};

export const getNotionPageTitle =
  nPage => {
  const props = nPage.properties;
  for (const [key, value] of Object.entries(props)) {
    if (value[NOTION_KEY_TYPE] === NOTION_DATA_TYPE_TITLE) {
      const title = value[NOTION_DATA_TYPE_TITLE][0][NOTION_KEY_PLAIN_TEXT];
      return title;
    }
  }
};

export const getNotionDbaseProperties =
  (notionDatas, relMap) => {
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

          metadata[DGMD_BLOCK_TYPE_ID] = {
            [DGMD_TYPE]: DGMD_BLOCK_TYPE_ID,
            [DGMD_VALUE]: idSansHyphens
          };
        }
        else if (key === NOTION_DATA_TYPE_ICON) {
          //todo: handle type here correctly
          const iconObj = getIcon( resultData[key] );
          metadata[DGMD_BLOCK_TYPE_ICON] = {
            [DGMD_TYPE]: iconObj[NOTION_KEY_TYPE],
            [DGMD_VALUE]: iconObj[NOTION_KEY_VALUE]
          };
        }
        else if (key === NOTION_DATA_TYPE_COVER) {
          //todo: handle type here correctly
          const coverObj = getCover( resultData[key] );
          metadata[DGMD_BLOCK_TYPE_COVER] = {
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
                propdata[propertyKey] = {
                  [DGMD_TYPE]: DGMD_BLOCK_TYPE_FILE_EXTERNAL,
                  [DGMD_VALUE]: files.length > 0 ? files : null
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
                    [DGMD_RELATION_DATABASE_ID]: dbId,
                    [DGMD_RELATION_PAGE_ID]: removeHyphens( m[NOTION_KEY_ID] )
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
                if (formulaType === NOTION_FORMULA_RESULT_DATE) {
                  const dgmdDateVal = convertDateFromNotionToDGMD( propertyVal[formulaType] );
                  propdata[propertyKey] = {
                    [DGMD_TYPE]: DGMD_BLOCK_TYPE_FORMULA_DATE,
                    [DGMD_VALUE]: dgmdDateVal
                  };
                }
                else {
                  const dgmdFormulaType = {
                    [NOTION_FORMULA_RESULT_STRING]: DGMD_BLOCK_TYPE_FORMULA_STRING,
                    [NOTION_FORMULA_RESULT_BOOLEAN]: DGMD_BLOCK_TYPE_FORMULA_BOOLEAN,
                  }[formulaType];
                  propdata[propertyKey] = {
                    [DGMD_TYPE]: dgmdFormulaType,
                    [DGMD_VALUE]: propertyVal[formulaType]
                  };
                }
              }
              else {
                // todo... handle other types
                // console.log(
                //   '***',
                //   'propertyType', propertyType,
                //   'prototypeKey', propertyKey
                // ); yaya
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

const getNotionDbasePromise =
  (nClient, allPages, relMap, collector, queryObj) => {
  const p = new Promise((resolve, reject) => {

    nClient[NOTION_KEY_DBS].query( queryObj )
      .then( result => {
        const properties = getNotionDbaseProperties( result, relMap );
        collector[QUERY_PROPERTIES].push( ...properties );

        const has_more = result[NOTION_CURSOR_HAS_MORE];
        const next_cursor = result[NOTION_CURSOR_NEXT];

        collector[QUERY_PAGES][NOTION_CURSOR_NEXT] = next_cursor;
        collector[QUERY_PAGES][NOTION_CURSOR_HAS_MORE] = has_more;

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
      [NOTION_KEY_DB_ID]: dbId
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

const getNotionDbase = 
  ( nClient, meta, dbId, relMap ) => {
  const collector = {
    [QUERY_PROPERTIES]: [],
    [QUERY_PAGES]: {
      [NOTION_CURSOR_HAS_MORE]: false,
      [NOTION_CURSOR_NEXT]: null
    }
  };
  
  const initStartCursorType = meta[DATABASE_QUERY_PAGE_CURSOR_TYPE];
  if (initStartCursorType === DATABASE_QUERY_PAGE_CURSOR_TYPE_NONE) {
    return Promise.resolve( collector );
  }
  const specificPage = initStartCursorType === DATABASE_QUERY_PAGE_CURSOR_TYPE_SPECIFIC;
  const allPages = initStartCursorType === DATABASE_QUERY_PAGE_CURSOR_TYPE_ALL;
  const initStartCursor =
    specificPage ? meta[DATABASE_QUERY_PAGE_CURSOR_ID] : null;

  return chainNotionDbasePromises( 
    nClient, dbId, allPages, relMap, initStartCursor, true, collector );
};

const getCover =
  cover => {
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

const getIcon =
  icon => {
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

const getDbMeta = 
  (primary, dbId, dbPgCursor) => {
  const obj = {
    [DATABASE_QUERY_PRIMARY]: primary,
    [DATABASE_QUERY_ID]: dbId,
    [DATABASE_QUERY_TITLE]: undefined,
    [DATABASE_QUERY_DESCRIPTION]: undefined,
    [DATABASE_QUERY_PARENT_ID]: undefined,
    [DATABASE_QUERY_PARENT_TITLE]: undefined,
    [DATABASE_QUERY_PARENT_TYPE]: undefined,
    [DATABASE_QUERY_COVER]: undefined,
    [DATABASE_QUERY_ICON]: undefined
  };
  if (dbPgCursor) {
    obj[DATABASE_QUERY_PAGE_CURSOR_TYPE] = dbPgCursor[DATABASE_QUERY_PAGE_CURSOR_TYPE_REQUEST];
    obj[DATABASE_QUERY_PAGE_CURSOR_ID] = dbPgCursor[DATABASE_QUERY_PAGE_CURSOR_ID_REQUEST];
  }
  return obj;
};

const notionUpdateDbMeta = 
  async(nClient, nDbase, meta) => {
  try {
    const primaryTitle = getNotionDbaseTitle( nDbase );
    meta[DATABASE_QUERY_TITLE] = primaryTitle;
    const primaryDescription = getNotionDbaseDescription( nDbase );
    meta[DATABASE_QUERY_DESCRIPTION] = primaryDescription;
    const primaryCover = getCover( nDbase[NOTION_DATA_TYPE_COVER] );
    meta[DATABASE_QUERY_COVER] = primaryCover[NOTION_KEY_VALUE];
    const primaryIcon = getIcon( nDbase[NOTION_DATA_TYPE_ICON] );
    meta[DATABASE_QUERY_ICON] = primaryIcon[NOTION_KEY_VALUE];
  }
  catch (e) {
    console.log( 'primary meta collection error', e );
  }
  try {
    const [primaryParentId, primaryParentType] = getNotionDbaseParentId( nDbase );
    meta[DATABASE_QUERY_PARENT_ID] = primaryParentId;
    if (primaryParentType === NOTION_KEY_PAGE_ID) {
      const primaryPageParent = await nClient[NOTION_KEY_PAGES].retrieve({ [NOTION_KEY_PAGE_ID]: primaryParentId });
      const primaryPageParentTitle = getNotionPageTitle( primaryPageParent );
      meta[DATABASE_QUERY_PARENT_TITLE] = primaryPageParentTitle;
      meta[DATABASE_QUERY_PARENT_TYPE] = primaryParentType;
    }
  }
  catch (e) {
    console.log( 'unable to load parent page information' );
  }
};

const convertDateFromNotionToDGMD =
  dateObj => {
  const startDate = dateObj[NOTION_KEY_START_DATE];
  const endDate = dateObj[NOTION_KEY_END_DATE];
  const timeZone = dateObj[NOTION_KEY_TIME_ZONE];
  return {
    [DGMD_START_DATE]: startDate,
    [DGMD_END_DATE]: endDate,
    [DGMD_TIME_ZONE]: timeZone
  };
};

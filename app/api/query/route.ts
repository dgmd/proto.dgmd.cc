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
  EXPORT_DATA_TYPE,
  EXPORT_DATA_VALUE,
  EXPORT_DATA_KEY,
  
  //TODO: RENAME
  NOTION_RESULT_SUCCESS,
  NOTION_RESULT_ERROR,
  NOTION_RESULT,
  
  NOTION_RESULT_PRIMARY_DATABASE,
  NOTION_RESULT_RELATION_DATABASES,
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_DATABASE_ID,
  NOTION_RESULT_DATABASE_TITLE,

  NOTION_RESULT_RELATION_DATABASE_ID,
  NOTION_RESULT_RELATION_BLOCK_ID,
  
  NOTION_RESULT_BLOCK_KEY,
  NOTION_RESULT_BLOCK_DBS,
  URL_SEARCH_PARAM_DATABASE,
  URL_SEARCH_PARAM_BLOCKS_REQUEST,
  URL_SEARCH_PARAM_RELATIONS_REQUEST
  
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
const NOTION_DATA_TYPE_TITLE = 'title';
const NOTION_DATA_TYPE_RICH_TEXT = 'rich_text';
const NOTION_DATA_TYPE_CHECKBOX = 'checkbox';
const NOTION_DATA_TYPE_EMAIL = 'email';
const NOTION_DATA_TYPE_STATUS = 'status';
const NOTION_DATA_TYPE_RELATION = 'relation';
const NOTION_DATA_TYPE_CHILD_DATABASE = 'child_database';
const NOTION_DATA_TYPE_PHONE_NUMBER = 'phone_number';
const NOTION_DATA_TYPE_FORMULA = 'formula';
const NOTION_DATA_TYPE_URL = 'url';
const NOTION_DATA_TYPE_DATE = 'date';
const NOTION_DATA_LAST_EDITED_TIME = 'last_edited_time';
const NOTION_DATA_CREATED_TIME = 'created_time';

const NOTION_KEY_NAME = 'name';
const NOTION_KEY_FILE = 'file';
const NOTION_KEY_URL = 'url';
const NOTION_KEY_EXTERNAL = 'external';
const NOTION_KEY_PLAIN_TEXT = 'plain_text';
const NOTION_KEY_DATABASE_ID = 'database_id';
const NOTION_KEY_ID = 'id';

const QUERY_PRIMARY = 'QUERY_PRIMARY';
const QUERY_ID = 'QUERY_ID';
const QUERY_NAME = 'QUERY_NAME';
const QUERY_PROPERTIES = 'QUERY_PROPERTIES';

const SECRET_ID = 'SECRET_ID';
const DATABASE_ID = 'DATABASE_ID';
const RELATIONS_REQUEST = 'RELATIONS_REQUEST';
const BLOCKS_REQUEST = 'BLOCKS_REQUEST';

export async function GET( request, response ) {

  const secrets = {
    [SECRET_ID]: process.env.NOTION_SECRET,
    [DATABASE_ID]: null
  };
  const requests = {
    [RELATIONS_REQUEST]: false,
    [BLOCKS_REQUEST]: false
  };

  const params = request.nextUrl.searchParams;
  if (params.has(URL_SEARCH_PARAM_DATABASE)) {
    const dbId = params.get(URL_SEARCH_PARAM_DATABASE);
    secrets[DATABASE_ID] = dbId;
  }
  if (params.has(URL_SEARCH_PARAM_RELATIONS_REQUEST)) {
    const relations = params.get(URL_SEARCH_PARAM_RELATIONS_REQUEST);
    requests[RELATIONS_REQUEST] = stringToBoolean(relations);
  }
  if (params.has(URL_SEARCH_PARAM_BLOCKS_REQUEST)) {
    const blocks = params.get(URL_SEARCH_PARAM_BLOCKS_REQUEST);
    requests[BLOCKS_REQUEST] = stringToBoolean(blocks);
  }

  try {

    // connect to NOTION
    const nClient = new Client({ 
      auth: secrets[SECRET_ID]
    });

    //prepare queries for the databases
    //next, collect all databases
    const notionDbases = await nClient.databases.retrieve({
      [NOTION_KEY_DATABASE_ID]: secrets[DATABASE_ID]
    });

    //all of this nonsense because title is not in the typescript
    let primaryTitle = '';
    for (const [key, value] of Object.entries(notionDbases)) {
      if (key === 'title') {
        primaryTitle = value[0].plain_text;
      }
    }
    
    const notionDbaseQueryPromises = [
      getNotionDbasePromise( nClient, secrets[DATABASE_ID], primaryTitle, true ),
    ];

    if (requests[RELATIONS_REQUEST]) {

      //parse the database names
      const nDbRelationIds =
        getNotionDbaseRelationIds( notionDbases );
      //remove the primary database id
      nDbRelationIds.delete( secrets[DATABASE_ID] );

      nDbRelationIds.forEach( (dbaseTitle, dbaseId) => {
        notionDbaseQueryPromises.push( 
          getNotionDbasePromise( nClient, dbaseId, dbaseTitle, false )
        );
      } );
    }

    //execute all queries
    const allDbResults = await Promise.all( notionDbaseQueryPromises );

    const orgDbResult = {
      [NOTION_RESULT_PRIMARY_DATABASE]: null,
    };
    if (requests[RELATIONS_REQUEST]) {
      orgDbResult[NOTION_RESULT_RELATION_DATABASES] = [];
    }

    //organize the results
    const orgDbResults = allDbResults.reduce( (acc, cur) => {
      const qId = cur[QUERY_ID];
      const qPrimary = cur[QUERY_PRIMARY];
      const qProps = cur[QUERY_PROPERTIES];
      const qName = cur[QUERY_NAME];

      //go through all relations and find their database ids
      for (const qProp of qProps) {
        for (const [qPropKey, qPropObj] of Object.entries(qProp)) {
          if (qPropObj[EXPORT_DATA_TYPE] === NOTION_DATA_TYPE_RELATION) {
            const qPropValues = qPropObj[EXPORT_DATA_VALUE];
            for (const qPropValue of qPropValues) {
              const dbId = findRelationDbId( allDbResults, qPropValue[NOTION_RESULT_RELATION_BLOCK_ID] );
              qPropValue[NOTION_RESULT_RELATION_DATABASE_ID] = dbId;
            }
          }
        }
      }

      const dbResult = {
        [NOTION_RESULT_BLOCKS]: qProps,
        [NOTION_RESULT_DATABASE_ID]: qId,
        [NOTION_RESULT_DATABASE_TITLE]: qName
      };

      if (qPrimary) {
        acc[NOTION_RESULT_PRIMARY_DATABASE] = dbResult
      }
      else if (requests[RELATIONS_REQUEST]) {
        acc[NOTION_RESULT_RELATION_DATABASES].push( dbResult );
      }
      return acc;
    }, orgDbResult );

    if (requests[BLOCKS_REQUEST]) {
      const notionPageBlockQueryPromises = [];
      allDbResults.forEach( dbResult => {
        const qProps = dbResult[QUERY_PROPERTIES];
        qProps.forEach( qProp => {
          const qPropId = qProp[DGMDCC_ID][EXPORT_DATA_VALUE];
          const result = getNotionPageBlockPromise( nClient, qPropId );
          notionPageBlockQueryPromises.push( result );
        });
      });
      const notionBlockResults = await Promise.all( notionPageBlockQueryPromises );
      const notionBlockResultsIndexed = notionBlockResults.reduce((result, item) => {
        if (NOTION_RESULT_BLOCK_KEY in item && NOTION_RESULT_BLOCK_DBS in item) {
          result.push( {
            [NOTION_RESULT_BLOCK_KEY]: item[NOTION_RESULT_BLOCK_KEY],
            [NOTION_RESULT_BLOCK_DBS]: item[NOTION_RESULT_BLOCK_DBS]
          } );
        }
        return result;
      }, [] );
      
      orgDbResults[NOTION_RESULT_BLOCKS] = notionBlockResultsIndexed;
    }

    return createResponse( {
      [NOTION_RESULT_SUCCESS]: true,
      [NOTION_RESULT]: orgDbResults
    }, request );

  }
  catch ( e ) {
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

const getNotionDbaseRelationIds = notionDbases => {
  const ids = new Map();
  if (NOTION_PROPERTIES in notionDbases) {
    const ndbProperties = notionDbases[NOTION_PROPERTIES];
    const ndbPropertiesKeys = Object.keys( ndbProperties );
    for (const ndbPropertiesKey of ndbPropertiesKeys) {
      const ndpPropertyVal = ndbProperties[ndbPropertiesKey];
      const ndpPropertyType = ndpPropertyVal[NOTION_DATA_TYPE];
      if (ndpPropertyType === NOTION_DATA_TYPE_RELATION) {
        const relation = ndpPropertyVal[NOTION_DATA_TYPE_RELATION];
        const dbaseId = relation[NOTION_KEY_DATABASE_ID];
        ids.set( removeHyphens(dbaseId), ndbPropertiesKey );
      }
    }
  }
  return ids;
};

const getNotionDbaseProperties = notionDatas => {
  if (NOTION_RESULTS in notionDatas) {
    const data = notionDatas[NOTION_RESULTS].map( (resultData, index) => {
      const somedata = {};
      const keys = Object.keys( resultData );
      for (const key of keys) {
        if (key === NOTION_ID) {

          const id = resultData[key];
          const idSansHyphens = removeHyphens( id );

          somedata[DGMDCC_ID] = {
            [EXPORT_DATA_TYPE]: DGMDCC_ID,
            [EXPORT_DATA_VALUE]: idSansHyphens
          };
        }
        else if (key === NOTION_URL) {

          somedata[DGMDCC_URL] = {
            [EXPORT_DATA_TYPE]: DGMDCC_URL,
            [EXPORT_DATA_VALUE]: resultData[key]
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

                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_SELECT,
                  [EXPORT_DATA_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_MULTI_SELECT) {
                
                const multis = propertyVal.map( m => m[NOTION_KEY_NAME] );
                somedata[propertyKey] = {
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
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_FILES,
                  [EXPORT_DATA_VALUE]: file
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_NUMBER) {

                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_NUMBER,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_CHECKBOX) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_CHECKBOX,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_URL) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_URL,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_EMAIL) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_EMAIL,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_PHONE_NUMBER) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_PHONE_NUMBER,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_STATUS) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: NOTION_DATA_TYPE_STATUS,
                  [EXPORT_DATA_VALUE]: propertyVal[NOTION_KEY_NAME]
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_TITLE || propertyType == NOTION_DATA_TYPE_RICH_TEXT) {

                const titles = propertyVal.map( m => m[NOTION_KEY_PLAIN_TEXT] );
                const val = titles.length > 0 ? titles[0] : null;

                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_RELATION) {
                const val = propertyVal.map( m => {
                  return {
                    [NOTION_RESULT_RELATION_DATABASE_ID]: null,
                    [NOTION_RESULT_RELATION_BLOCK_ID]: removeHyphens( m[NOTION_KEY_ID] )
                  } });
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: val
                };
              }
              else if (propertyType == NOTION_DATA_TYPE_DATE) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_LAST_EDITED_TIME) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              else if (propertyType == NOTION_DATA_CREATED_TIME) {
                somedata[propertyKey] = {
                  [EXPORT_DATA_TYPE]: propertyType,
                  [EXPORT_DATA_VALUE]: propertyVal
                };
              }
              
              // else if (propertyType == NOTION_DATA_TYPE_FORMULA) {
              //   somedata[propertyKey] = {
              //     [EXPORT_DATA_TYPE]: propertyType,
              //     [EXPORT_DATA_VALUE]: propertyVal
              //   };
              //   console.log( 'NOTION_DATA_TYPE_FORMULA', propertyKey, propertyVal );
              // }
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
              ].includes( propertyType )) {

                somedata[propertyKey] = {
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

const getNotionDbasePromise = (nClient, dbaseId, dbaseName, primary) => {
  const p = new Promise((resolve, reject) => {
    nClient.databases.query({ [NOTION_KEY_DATABASE_ID]: dbaseId })
      .then( result => {
        const properties = getNotionDbaseProperties( result );
        const propertyObj = {
          [QUERY_PRIMARY]: primary,
          [QUERY_PROPERTIES]: properties,
          [QUERY_ID]: dbaseId,
          [QUERY_NAME]: dbaseName,
        };
        resolve( propertyObj );
      })
      .catch(error => {
        reject( error );
      });
  });
  return p;
};

const getNotionBlockKeyedDatabases = blockDatas => {
  if (NOTION_RESULTS in blockDatas) {
    const somedata = blockDatas[NOTION_RESULTS].reduce( (acc, cur) => {
      const propertyType = cur[NOTION_DATA_TYPE];
      const propertyVal = cur[propertyType];
      const gotPropertyVal = propertyVal !== null && propertyVal !== undefined;
      if (gotPropertyVal && propertyType === NOTION_DATA_TYPE_CHILD_DATABASE) {
        const id = cur[NOTION_KEY_ID];
        const idSansHyphens = removeHyphens( id );
        const propertyValTitle = propertyVal[NOTION_DATA_TYPE_TITLE];
        const obj = {
          [EXPORT_DATA_KEY]: idSansHyphens,
          [EXPORT_DATA_VALUE]: propertyValTitle
        };
        acc.push( obj );
      }
      return acc;
    }, [] );
    return somedata;
  }
  return [];
};

const getNotionPageBlockPromise = (nClient, blockId) => {
  const p = new Promise((resolve, reject) => {
    nClient.blocks.children.list( { 
      block_id: blockId,
      page_size: 50
    } )
    .then( result => {
      const keyedDatabases = getNotionBlockKeyedDatabases( result );
      resolve( {
        [NOTION_RESULT_BLOCK_KEY]: blockId,
        [NOTION_RESULT_BLOCK_DBS]: keyedDatabases
      } );
    })
    .catch( error => {
      reject(error);
    });
  });
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

const findRelationDbId = (allResults, blockId) => {
  for (const cur of allResults) {
    const qId = cur[QUERY_ID];
    const qProps = cur[QUERY_PROPERTIES];
    for (const qProp of qProps) {
      for (const [qPropKey, qPropObj] of Object.entries(qProp)) {
        if (qPropObj[EXPORT_DATA_TYPE] === NOTION_ID) {
          const idValue = qPropObj[EXPORT_DATA_VALUE];
          if (idValue === blockId) {
            return qId;
          }
        }
      }
    }
  }
  return null;
};
export const getNotionPageBlocks = 
  async ( nClient, allDbResults ) => {
  const notionPagePromises = [];
  allDbResults.forEach( dbResult => {
    const qProps = dbResult[QUERY_PROPERTIES];
    qProps.forEach( qProp => {
      const qPropId = qProp[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
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

const getNotionPageBlockPromise = 
  async(nClient, blockId, collector) => {
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


const getNotionBlockKeyedDatabases = 
  (blockDatas, collector) => {
  if (NOTION_RESULTS in blockDatas) {
    const somedata = blockDatas[NOTION_RESULTS].reduce( (acc, cur) => {
      const propertyType = cur[NOTION_KEY_TYPE];
      const propertyVal = cur[propertyType];
      const gotPropertyVal = !isNil(propertyVal);
      const id = cur[NOTION_KEY_ID];
      const idSansHyphens = removeHyphens( id );

      if (gotPropertyVal) {
        const propertyValTitle = propertyVal[NOTION_DATA_TYPE_TITLE];
        if (propertyType === NOTION_DATA_TYPE_CHILD_DATABASE) {
          const obj = {
            [DGMD_PAGE_ID]: idSansHyphens,
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
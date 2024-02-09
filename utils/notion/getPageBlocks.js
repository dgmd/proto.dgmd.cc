export const loadPageBlocks = 
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

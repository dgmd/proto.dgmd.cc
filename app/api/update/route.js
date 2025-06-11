export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  NOTION_KEY_DB_ID,
  NOTION_KEY_ID,
  NOTION_KEY_PAGES,
  NOTION_KEY_PAGE_ID,
  NOTION_KEY_PARENT,
  NOTION_RESULTS,
} from '@/utils/notion/notionConstants.js';
import {
  NOTION_WRANGLE_KEY_RELATIONS_MAP
} from '@/utils/notion/notionWranglerConstants.js';
import {
  getNotionDbaseProperties,
  getNotionDbaseRelationsIds
} from '@/utils/notion/queryDatabases.js';
import {
  removeHyphens
} from '@/utils/utils.js';
import {
  Client
} from "@notionhq/client";
import {
  CRUD_PARAM_CREATE_BLOCK_ID,
  CRUD_PARAM_CREATE_CHILDREN,
  CRUD_PARAM_CREATE_META,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_RESPONSE_BLOCK,
  CRUD_RESPONSE_BLOCK_ID,
  CRUD_RESPONSE_BLOCK_KEY,
  CRUD_RESPONSE_CREATE,
  CRUD_RESPONSE_CREATE_BLOCKS,
  CRUD_RESPONSE_CREATE_ID,
  CRUD_RESPONSE_CREATE_METAS,
  CRUD_RESPONSE_DB_ID,
  CRUD_RESPONSE_DELETE,
  CRUD_RESPONSE_DELETE_ID,
  CRUD_RESPONSE_ERROR,
  CRUD_RESPONSE_META,
  CRUD_RESPONSE_META_ID,
  CRUD_RESPONSE_META_KEY,
  CRUD_RESPONSE_OPTIONS,
  CRUD_RESPONSE_PAGE,
  CRUD_RESPONSE_RESULT,
  CRUD_RESPONSE_RESULT_TYPE,
  CRUD_RESPONSE_UPDATE,
  CRUD_RESPONSE_UPDATE_BLOCKS,
  CRUD_RESPONSE_UPDATE_ID,
  CRUD_RESPONSE_UPDATE_METAS,
  DGMD_BLOCK_TYPE_CHECKBOX,
  DGMD_BLOCK_TYPE_COVER,
  DGMD_BLOCK_TYPE_CREATED_TIME,
  DGMD_BLOCK_TYPE_DATE,
  DGMD_BLOCK_TYPE_EMAIL,
  DGMD_BLOCK_TYPE_EMOJI,
  DGMD_BLOCK_TYPE_EXTERNAL_URL,
  DGMD_BLOCK_TYPE_FILES,
  DGMD_BLOCK_TYPE_FILE_EXTERNAL,
  DGMD_BLOCK_TYPE_FILE_UPLOAD,
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
  DGMD_END_DATE,
  DGMD_RELATION_PAGE_ID,
  DGMD_START_DATE,
  DGMD_TYPE,
  DGMD_VALUE,
} from "constants.dgmd.cc";
import {
  isNil
} from 'lodash-es';
import yn from 'yn';

import {
  cleanupFiles,
  extractDataFromRequest,
  processAndUploadFiles
} from './fileTransfers.js';
import {
  processAndUploadURLs
} from './urlTransfers.js';

const DEBUG = process.env.DEBUG === 'true';

export async function OPTIONS(request) {
  return createCorsHeadedResponse({
    [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_OPTIONS,
    [CRUD_RESPONSE_RESULT]: {
      [CRUD_RESPONSE_OPTIONS]: false
    }
  }, request);
};

// Common function to process properties and convert them to Notion format
function processPropsToNotionFormat(propsObj, notionFileUploads, notionURLUploads) {
  const notionPropsObj = {};
  for (const [key, userBlock] of Object.entries(propsObj)) {
    const mmBlock = mmPropToNotionBlock(
      userBlock, notionFileUploads, notionURLUploads);
    if (!isNil(mmBlock)) {
      notionPropsObj[key] = mmBlock;
    }
  }
  return notionPropsObj;
}

// Common function to process meta properties
function processMetasToNotionFormat(metasObj) {
  const notionMetaObj = {};
  for (const [key, userBlock] of Object.entries(metasObj)) {
    const mmBlock = mmMetaToNotionBlock(userBlock);
    if (!isNil(mmBlock)) {
      notionMetaObj[key] = mmBlock;
    }
  }
  return notionMetaObj;
}

// Helper to retrieve and format page data
async function retrieveAndFormatPage(nClient, pageId, parentDbId = null) {
  const page = await nClient[NOTION_KEY_PAGES].retrieve({ [NOTION_KEY_PAGE_ID]: pageId });
  
  // If parent DB ID wasn't provided, extract it from the page
  if (!parentDbId) {
    parentDbId = removeHyphens(page[NOTION_KEY_PARENT][NOTION_KEY_DB_ID]);
  }
  
  const relationsData = await getNotionDbaseRelationsIds(nClient, parentDbId);
  const relMap = relationsData[NOTION_WRANGLE_KEY_RELATIONS_MAP];
  return {
    page: getNotionDbaseProperties({ [NOTION_RESULTS]: [page] }, relMap)[0],
    parentDbId
  };
}

export async function PUT( request ) {
  const rObj = {
    [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_UPDATE,
    [CRUD_RESPONSE_RESULT]: {
      [CRUD_RESPONSE_UPDATE]: false
    }
  };
  
  let uploadedFiles = [];
  
  try {
    const { data, uploadedFiles: files } = await extractDataFromRequest( request );
    uploadedFiles = files;
    
    // Process files and upload to Notion
    const notionUploads = await processAndUploadFiles( data.files || [] );
    const notionXfers = await processAndUploadURLs( data );
    await Promise.all([notionUploads, notionXfers]);
    
    // Process properties and meta data
    const updatePageId = removeHyphens(data[CRUD_PARAM_UPDATE_BLOCK_ID]);
    const updatePropObj = processPropsToNotionFormat( 
      data[CRUD_PARAM_UPDATE_BLOCK], notionUploads, notionXfers );
    const updateMetaObj = processMetasToNotionFormat( 
      data[CRUD_PARAM_UPDATE_META] || {} );

    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    
    // Update blocks
    const rBlocks = [];
    for (const [key, value] of Object.entries(updatePropObj)) {
      await updateBlock( nClient, updatePageId, key, value, rBlocks );
    }

    // Update metas
    const rMetas = [];
    for (const [key, value] of Object.entries(updateMetaObj)) {
      if (key === DGMD_BLOCK_TYPE_ICON || key === DGMD_BLOCK_TYPE_COVER) {
        await updateMeta( nClient, updatePageId, key, value, rMetas );
      }
    }

    // Get updated page data
    const { page, parentDbId } = await retrieveAndFormatPage( nClient, updatePageId );
    
    // Construct response
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = parentDbId;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = page;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE] = true;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_ID] = updatePageId;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_METAS] = rMetas;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_UPDATE_BLOCKS] = rBlocks;
  }
  catch (error) {
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_ERROR] = error.message;
  }
  finally {
    await cleanupFiles(uploadedFiles);
  }
  return createCorsHeadedResponse( rObj, request );
};

export async function POST( request ) {
  const rObj = {
    [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_CREATE,
    [CRUD_RESPONSE_RESULT]: {
      [CRUD_RESPONSE_CREATE]: false,
    }
  };
  
  let uploadedFiles = [];
  
  try {
    console.warn( '1POST /update request:', request );
    const { data, uploadedFiles: files } = await extractDataFromRequest( request );
    uploadedFiles = files;
    
    // Process files and upload to Notion
    console.trace('tPOST /update data:', data);
    console.error('ePOST /update data:', data);
    console.warn('pPOST /update data:', data);
    console.log('lProcessing files and URLs for upload ...', data.files);
    const notionUploads = await processAndUploadFiles( data.files || [] );
    const notionXfers = await processAndUploadURLs( data );
    await Promise.all([notionUploads, notionXfers]);
    
    // Process properties and meta data
    const appendDbId = removeHyphens(data[CRUD_PARAM_CREATE_BLOCK_ID]);
    const appendNotionPropsObj = processPropsToNotionFormat( 
      data[CRUD_PARAM_CREATE_CHILDREN], notionUploads, notionXfers );
    const appendNotionMetaObj = processMetasToNotionFormat( data[CRUD_PARAM_CREATE_META] || {} );
    
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    
    // Create the page
    const createObj = await nClient[NOTION_KEY_PAGES].create({
      parent: {
        type: NOTION_KEY_DB_ID,
        [NOTION_KEY_DB_ID]: appendDbId
      },
      properties: {},
      children: [],
    });
    const createPageId = removeHyphens( createObj[NOTION_KEY_ID] );
    
    // Update blocks
    const rBlocks = [];
    for (const [key, value] of Object.entries(appendNotionPropsObj)) {
      await updateBlock( nClient, createPageId, key, value, rBlocks );
    }
    
    // Update metas
    const rMetas = [];
    for (const [key, value] of Object.entries(appendNotionMetaObj)) {
      if (key === DGMD_BLOCK_TYPE_ICON || key === DGMD_BLOCK_TYPE_COVER) {
        await updateMeta( nClient, createPageId, key, value, rMetas );
      }
    }

    // Get updated page data
    const { page } = await retrieveAndFormatPage( nClient, createPageId, appendDbId );

    // Construct response
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_PAGE] = page;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE] = true;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DB_ID] = appendDbId;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_ID] = createPageId;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_BLOCKS] = rBlocks;
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_CREATE_METAS] = rMetas;
  }
  catch (error) {
    console.error('Error in POST /update:', error);
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_ERROR] = error.message;
  }
  finally {
    await cleanupFiles(uploadedFiles);
  }
  return createCorsHeadedResponse( rObj, request );
};

export async function DELETE( request ) {
  const rObj = {
    [CRUD_RESPONSE_RESULT_TYPE]: CRUD_RESPONSE_DELETE,
    [CRUD_RESPONSE_RESULT]: {
      [CRUD_RESPONSE_DELETE]: false
    }
  };

  let uploadedFiles = [];
  
  try {
    const { data, uploadedFiles: files } = await extractDataFromRequest( request );
    uploadedFiles = files;
    
    const nClient = new Client({ 
      auth: process.env.NOTION_SECRET
    });
    const params = request.nextUrl.searchParams;
    const deleteBlockId = removeHyphens( params.get(CRUD_PARAM_DELETE_BLOCK_ID) );
    
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DELETE_ID] = deleteBlockId;
    await nClient.blocks.delete({ block_id: deleteBlockId });
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_DELETE] = true;
  }
  catch (error) {
    rObj[CRUD_RESPONSE_RESULT][CRUD_RESPONSE_ERROR] = error.message;
  }
  finally {
    await cleanupFiles(uploadedFiles);
  }

  return createCorsHeadedResponse( rObj, request );
};


const delay = ms => new Promise(res => setTimeout(res, ms));

const updateBlock = async (nClient, pageId, blockKey, blockValue, responseBlocks) => {
  try {

    // https://www.reddit.com/r/Notion/comments/s8uast/error_deleting_all_the_blocks_in_a_page/
    await delay( 50 );

    const blockResponse =
    await nClient[NOTION_KEY_PAGES].update({
      [NOTION_KEY_PAGE_ID]: pageId,
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
    console.error('Update block error:', e);
    responseBlocks.push( {
      [CRUD_RESPONSE_BLOCK]: false,
      [CRUD_RESPONSE_BLOCK_KEY]: blockKey,
    } );
  }
};

const updateMeta = async (nClient, pageId, metaKey, metaValue, responseMetas) => {
  try {

    // https://www.reddit.com/r/Notion/comments/s8uast/error_deleting_all_the_blocks_in_a_page/
    await delay( 50 );

    const metaResponse =
    await nClient[NOTION_KEY_PAGES].update({
      [NOTION_KEY_PAGE_ID]: pageId,
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
    console.error('Update meta error:', e);
    responseMetas.push( {
      [CRUD_RESPONSE_META]: false,
      [CRUD_RESPONSE_META_KEY]: metaKey,
    } );
  }
};

//
//  BLOCK UPDATE CONVERTERS

const mmPropToNotionBlock = (block, notionUploads = [], urlUploads = []) => {
  const type = block[DGMD_TYPE];
  const value = block[DGMD_VALUE];

  if ([
    DGMD_BLOCK_TYPE_CREATED_TIME,
    DGMD_BLOCK_TYPE_LAST_EDITED_TIME
  ].includes(type)) {
    return null;
  }

  if (DGMD_BLOCK_TYPE_DATE === type) {
    if (typeof value === 'object') {
      const startDateValue = new Date( value[DGMD_START_DATE] );
      if (isFinite(startDateValue)) {
        const dateObj = {
          'start': startDateValue.toISOString()
        };
        const endDateValue = new Date( value[DGMD_END_DATE] );
        if (isFinite(endDateValue)) {
          dateObj['end'] = endDateValue.toISOString();
        }
        const rObj = { [type]: dateObj };
        return rObj;
      }
      return null;
    }
    try {
      const dateValue = new Date( value );
      if (isFinite(dateValue)) {
        const dateObj = {
          'start': dateValue.toISOString()
        };
        const rObj = { [type]: dateObj };
        return rObj;
      }
    }
    catch (e) {
      console.error( 'Error parsing date:', e );
    }
    return null;
  }

  if ([DGMD_BLOCK_TYPE_TITLE, DGMD_BLOCK_TYPE_RICH_TEXT].includes( type )) {
    const stringValue = String( value );
    return {
      [type]: [ {
        "text": {
          "content": stringValue
        }
      } ]
    };
  }

  if ([DGMD_BLOCK_TYPE_PHONE_NUMBER, DGMD_BLOCK_TYPE_URL, DGMD_BLOCK_TYPE_EMAIL].includes( type )) {
    const stringValue = String( value );
    return {
      [type]: stringValue
    };
  }

  if (type === DGMD_BLOCK_TYPE_SELECT || type === DGMD_BLOCK_TYPE_STATUS) {
    const stringValue = String( value );
    return {
      [type]: {
        "name": stringValue
      }
    };
  }

  if (type === DGMD_BLOCK_TYPE_NUMBER) {
    const numValue = Number( value );
    if (isFinite(numValue)) {
      return {
        [type]: numValue
      };
    }
  }

  if (type === DGMD_BLOCK_TYPE_MULTI_SELECT) {
    if (Array.isArray(value)) {
      const selects = value.map( v => {
        return {
          "name": String(v)
        };
      } );

      return {
        [type]: selects
      };
    }
  }

  if (type === DGMD_BLOCK_TYPE_CHECKBOX) {
    const booleanValue = yn( value );
    return {
      [type]: booleanValue
    };
  }

  // #https://developers.notion.com/reference/page-property-values#relation
  if (type === DGMD_BLOCK_TYPE_RELATION) {
    if (Array.isArray(value)) {

      if (value.every( v => typeof v === 'string' )) {
        return {
          [type]: value.map( v => {
            return {
              "id": v
            };
          } )
        };
      }
      if (value.every( v => {
        const isObj = typeof v === 'object';
        if (!isObj) {
          return false;
        }
        const hasPageId = v.hasOwnProperty( DGMD_RELATION_PAGE_ID );
        if (!hasPageId) {
          return false;
        }
        return true;
      })) {
        return {
          [type]: value.map( v => {
            return {
              "id": v[DGMD_RELATION_PAGE_ID]
            };
          } )
        };
      }
      return {
        [type]: value
      };
    }
  }
  
  if (type === DGMD_BLOCK_TYPE_FILES) {
    if (Array.isArray(value)) {
      const rvalue = value.reduce( (acc, cur) => {
        acc.push( genBlockTypeFileExternal( cur ) );
        return acc;
      }, [] );
      return {
        [type]: rvalue
      };
    }
  }

  if (type === DGMD_BLOCK_TYPE_EXTERNAL_URL) {
    if (Array.isArray(value) && value.length > 0) {
      
      const matchingUploads = urlUploads.filter(upload => 
        value.includes(upload.url) && upload.success === true
      );

      if (matchingUploads.length > 0) {
        return {
          [DGMD_BLOCK_TYPE_FILES]: matchingUploads.map(upload => ({
            "type": DGMD_BLOCK_TYPE_FILE_UPLOAD,
            [DGMD_BLOCK_TYPE_FILE_UPLOAD]: {
              [DGMD_BLOCK_TYPE_ID]: upload.data.id,
            }
          }))
        };
      }
    }
  }
  
  // Handle file uploads - map field names to Notion file IDs
  if (type === DGMD_BLOCK_TYPE_FILE_UPLOAD) {
    if (Array.isArray(value) && value.length > 0 && notionUploads.length > 0) {
      // Filter uploads to only those with matching fieldNames
      const matchingUploads = notionUploads.filter(upload => 
        value.includes(upload.fieldName)
      );
      
      if (matchingUploads.length > 0) {
        return {
          [DGMD_BLOCK_TYPE_FILES]: matchingUploads.map(upload => ({
            "type": DGMD_BLOCK_TYPE_FILE_UPLOAD,
            [DGMD_BLOCK_TYPE_FILE_UPLOAD]: {
              [DGMD_BLOCK_TYPE_ID]: upload.notionFileId
            }
          }))
        };
      }
    }
  }
  
  return null;
};
  
const mmMetaToNotionBlock = ( block ) => {
  const type = block[DGMD_TYPE];
  const value = block[DGMD_VALUE];
  if (type === DGMD_BLOCK_TYPE_EMOJI) {
    return {
      [type]: value,
    }
  }
  if (type === DGMD_BLOCK_TYPE_FILE_EXTERNAL) {
    return genBlockTypeFileExternal( value );
  }
};

const genBlockTypeFileExternal =
  ( value ) => {
  return {
    "type": DGMD_BLOCK_TYPE_FILE_EXTERNAL,
    // "name": "_",
    [DGMD_BLOCK_TYPE_FILE_EXTERNAL]: {
      "url": value
    }
  };
};
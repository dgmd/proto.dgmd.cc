import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  DGMD_BLOCKS,
  DGMD_INCLUDE_RELATION_DATABASES,
  DGMD_PRIMARY_DATABASE,
  DGMD_RELATION_DATABASES,
  DGMD_TYPE,
  DGMD_VALUE,
  QUERY_RESPONSE_KEY_ERROR,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS,
  QUERY_VALUE_RESULT_COUNT_ALL,
  SNAPSHOT_PARAM_ID,
  SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS,
  SNAPSHOT_PARAM_PRIMARY_TITLE_PROPERTY,
  SNAPSHOT_PARAM_RESULT_COUNT
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  cookies
} from 'next/headers';
import yn from 'yn';

export async function GET( request ) {
  try {
    const params = request.nextUrl.searchParams;
    if (!params.has(SNAPSHOT_PARAM_ID)) {
      throw new Error( 'missing snapshot id' );
    }
    const id = params.get(SNAPSHOT_PARAM_ID);
    const cookieStore = await cookies();
    const supabase = await createClient( cookieStore );
    const snapsQuery = await supabase
      .from( 'project_snapshots' )
      .select( 'snapshot' )
      .eq( 'id', id );
    if (!isNil(snapsQuery.error)) {
      throw new Error( 'cannot connect to snapshots' );
    }
    const snapshot = JSON.parse( snapsQuery.data[0].snapshot );

    let incRels = true;
    if (params.has(SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS)) {
      const paramValue = params.get(SNAPSHOT_PARAM_INCLUDE_RELATIONSHIPS);
      incRels = yn( paramValue );
    }
    if (!incRels) {
      snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_INCLUDE_RELATION_DATABASES] = false;
      delete snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_RELATION_DATABASES];
    }

    const titleSearch = params.has(SNAPSHOT_PARAM_PRIMARY_TITLE_PROPERTY);
    let resultCount = Number.POSITIVE_INFINITY;
    if (params.has(SNAPSHOT_PARAM_RESULT_COUNT) && !titleSearch) {
      const rawCount = params.get(SNAPSHOT_PARAM_RESULT_COUNT);
      if (rawCount !== QUERY_VALUE_RESULT_COUNT_ALL) {
        resultCount = parseInt(rawCount, 10);
        if (isNaN(resultCount)) {
          resultCount = Number.POSITIVE_INFINITY;
        }
      }
    }
    if (titleSearch) {
      const titleProperty = params.get(SNAPSHOT_PARAM_PRIMARY_TITLE_PROPERTY);
      const titlePropTrim = titleProperty.trim();
      if (titlePropTrim.length !== 0) {
        const allBlocks = snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS];
        const filteredBlocks = allBlocks.filter(block => {
          // Check each property in the block
          for (const [key, property] of Object.entries(block.PROPERTIES)) {
            // If property is of type 'title' and its value contains the search term
            if (property[DGMD_TYPE] === 'title' && 
                property[DGMD_VALUE] && 
                property[DGMD_VALUE].trim() === titlePropTrim) {
              return true;
            }
          }
          return false;
        });

        console.log( 'filteredBlocks', filteredBlocks.length, allBlocks.length );
        
        // Replace the blocks with filtered results
        snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] = filteredBlocks;
      }
    }
    if (isFinite(resultCount)) {
      const blocks = snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS];
      if (blocks.length > resultCount) {
        // Fisher-Yates shuffle
        for (let i = blocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }
        // Take first resultCount items
        snapshot[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] = blocks.slice(0, resultCount);
      }
    }
    return createCorsHeadedResponse( snapshot, request );
  }
  catch (e) {
    return createCorsHeadedResponse( {
      [QUERY_RESPONSE_KEY_ERROR]: e.message,
      [QUERY_RESPONSE_KEY_SUCCESS]: false
    } );
  }
};

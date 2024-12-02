import {
  createCorsHeadedResponse
} from '@/utils/coriHeaders.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  QUERY_RESPONSE_KEY_ERROR,
  QUERY_RESPONSE_KEY_SUCCESS
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';
import {
  cookies
} from 'next/headers';

import {
  SNAPSHOT_PARAM_ID
} from './keys.js';

export async function GET( request ) {
  try {
    const params = request.nextUrl.searchParams;
    if (!params.has(SNAPSHOT_PARAM_ID)) {
      throw new Error( 'missing snapshot id' );
    }
    const id = params.get(SNAPSHOT_PARAM_ID);
    const cookieStore = cookies();
    const supabase = await createClient( cookieStore );
    const snapsQuery = await supabase
      .from( 'project_snapshots' )
      .select( 'snapshot' )
      .eq( 'id', id );
    if (!isNil(snapsQuery.error)) {
      throw new Error( 'cannot connect to snapshots' );
    }
    const snapshot = JSON.parse( snapsQuery.data[0].snapshot );
    return createCorsHeadedResponse( snapshot, request );
  }
  catch (e) {
    return createCorsHeadedResponse( {
      [QUERY_RESPONSE_KEY_ERROR]: e.message,
      [QUERY_RESPONSE_KEY_SUCCESS]: false
    } );
  }
};

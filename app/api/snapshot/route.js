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
  NextResponse
} from 'next/server';

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
    const supabase = createClient( );
    const snapsQuery = await supabase
      .from( 'project_snapshots' )
      .select( 'snapshot' )
      .eq( 'id', id );
    if (!isNil(snapsQuery.error)) {
      throw new Error( 'cannot connect to snapshots' );
    }
    const snapshot = JSON.parse( snapsQuery.data[0].snapshot );
    return NextResponse.json( snapshot );
  }
  catch (e) {
    return NextResponse.json( {
      [QUERY_RESPONSE_KEY_ERROR]: e.message,
      [QUERY_RESPONSE_KEY_SUCCESS]: false
    } );
  }

};


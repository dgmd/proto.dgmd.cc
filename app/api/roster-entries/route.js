export const maxDuration = 300;

import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys.js';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  getAuthId,
  getAuthUser,
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  isNil
} from 'lodash-es';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTER_ENTRIES_AUTH,
  KEY_ROSTER_ENTRIES_DATA
} from './keys.js';

export async function GET( request ) {
  const rjson = {
    [KEY_ROSTER_ENTRIES_AUTH]: false
  };

  try {
    const asc = await getAuthServerCache( );
    if (!isAuthUser(asc)) {
      throw new Error( 'not authenticated' );
    }
    const user = getAuthUser( asc );
    const userId = getAuthId( user);
    const supabase = createClient( );

    const params = request.nextUrl.searchParams;
    if (!params.has(PARAM_ROSTERS_DB_ID)) {
      throw new Error( 'no database id' );
    }
    const dbId = params.get(PARAM_ROSTERS_DB_ID);

    const { 
      data: rostersData,
      error: rostersError
    } = await supabase
    .from( 'rosters' )
    .select( 'id' )
    .eq( 'user_id', userId )
    .eq( 'notion_id', dbId );
    if (!isNil(rostersError)) {
      throw new Error( 'roster retrieval error' );
    }

    const rostersDataId = rostersData[0].id;
    const {
      data: rosterEntriesData,
      error: rosterEntriesError
    } = await supabase
    .from( 'roster_entries' )
    .select( 'snapshot_name' )
    .eq( 'active', true )
    .eq( 'roster', rostersDataId );
    if (!isNil(rosterEntriesError)) {
      throw new Error( 'roster entries retrieval error' );
    }
    rjson[KEY_ROSTER_ENTRIES_AUTH] = true;
    rjson[KEY_ROSTER_ENTRIES_DATA] = rosterEntriesData;
  }
  catch (e) {
    console.error( 'roster entries error', e );
  }

  return NextResponse.json( rjson );
};
export const maxDuration = 300;

import {
  getAuthServerCache
} from '@/utils/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/auth/authUtils';
import {
  supabase
} from '@/utils/supa.js';
import {
  NextResponse
} from 'next/server';

import {
  KEY_ROSTER_AUTH
} from './keys.js';

export async function GET( req ) {

  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };

  const asc = await getAuthServerCache( );
  if (isAuthUser(asc)) {
    const activeRosters = await supabase
    .from( 'rosters' )
    .select( 'snapshot_name, notion_id' )
    .eq( 'active', true )
    .eq( 'user_id', auth.id );

    console.log( 'activeRosters', activeRosters );
  }
  return NextResponse.json( rjson );
};

// export async function POST( req ) {
//   const rjson = {
//     [KEY_ROSTER_AUTH]: false
//   };
//   const cookieStore = cookies();
//   const supabase = createClient( cookieStore );
//   const auth = await supabase.auth.getUser();
//   if (isAuthUser(auth)) {
//     const data = await req.json();
//     const dbId = data[PARAM_DB_ID];
//     if (!isNil(dbId)) {
//       rjson[KEY_ROSTER_AUTH] = true;
//       //go add table for this user
//     }
//   }


//   return NextResponse.json( rjson );
// };

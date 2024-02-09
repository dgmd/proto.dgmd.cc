import {
  isAuthUser
} from '@/utils/auth/authUtils';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  cookies
} from 'next/headers';
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

  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const auth = await supabase.auth.getUser();
  if (isAuthUser(auth)) {
    rjson[KEY_ROSTER_AUTH] = true;
  }

  //go get tables for this user and return them

  return NextResponse.json( rjson );
};

export async function POST( req ) {
  return NextResponse.json( {message: 'success' } );
};

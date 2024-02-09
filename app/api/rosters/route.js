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
  KEY_ROSTER_AUTH,
  PARAM_DB_ID
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
  const rjson = {
    [KEY_ROSTER_AUTH]: false
  };
  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const auth = await supabase.auth.getUser();
  if (isAuthUser(auth)) {
    const data = await req.json();
    const dbId = data[PARAM_DB_ID];
    if (!isNil(dbId)) {
      rjson[KEY_ROSTER_AUTH] = true;
      //go add table for this user
    }
  }


  return NextResponse.json( rjson );
};

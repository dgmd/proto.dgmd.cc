export const maxDuration = 300;

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  NextResponse
} from 'next/server';

export async function GET( request ) {
  console.log( "GET GET GET");
  const rjson = {
  };

  try {
    const supabase = createClient( );
    console.log( 'supa', supabase );

  }
  catch (e) {
    console.log( 'PROJECT GET ERROR', e.message );
  }

  console.log( 'GOT')
  return NextResponse.json( rjson );
};

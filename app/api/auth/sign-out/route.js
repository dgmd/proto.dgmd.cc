import {
  cookies
} from 'next/headers';
import {
  NextResponse
} from 'next/server';

import {
  createClient
} from '../../../../utils/supabase/server.js';

export async function POST() {
  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const x = await supabase.auth.signOut();
  return NextResponse.json( {} );
};
  
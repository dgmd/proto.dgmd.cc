import {
  createClient
} from '@/utils/supabase/server.js';
import {
  cookies
} from 'next/headers';
import {
  NextResponse
} from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  const supabase = await createClient( cookieStore );
  await supabase.auth.signOut();
  return NextResponse.json( {message: 'success' } );
};
  
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  NextResponse
} from 'next/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.json( {message: 'success' } );
};
  
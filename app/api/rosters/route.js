import {
  cookies
} from 'next/headers';
import {
  NextResponse
} from 'next/server';

import {
  createClient
} from '../../../utils/supabase/server.js';

export async function GET( req ) {

  const cookieStore = cookies();
  const supabase = createClient( cookieStore );
  const { data, error } = await supabase.auth.getUser();
  console.log( 'data', data, 'error', error );

  return NextResponse.json( { } );
}




// export async function GET( request, response ) {
//   const ok = supabase();
//   console.log( 'ok', ok );

//   // const cookiesStore = cookies();

//   // // Get the cookie containing the user ID:
//   // const userIdCookie = cookiesStore.get("userId");
//   // console.log( 'userIdCookie', cookiesStore );

//   // try {
//   //   const user = await supabase.auth.getUser();
//   //   console.log( 'user', user );
//   //   // res.status(200).json(user);
//   // } catch (error) {
//   //   console.log( 'user error', error );
//   //   // res.status(500).json({ error: 'Failed to fetch user data' });
//   // }

//   // const { data, error } = await supabase.auth.refreshSession();
//   // const { session, user } = data;
//   // console.log( 'session', session, 'user', user, 'data', data, 'error', error );
//   const resJson = NextResponse.json( {} );
//   return resJson;
// };
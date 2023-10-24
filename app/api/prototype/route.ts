import {
  NextResponse
} from 'next/server';

import {
  supabase
} from '../../../utils/supa.js';

import {
  URL_PROTOTYPE_PARAM_ID
} from './keys.js';

// import {
//   middleware
// } from 'middleware';

//
//https://github.com/vercel/next.js/discussions/47933#discussioncomment-6197807
//
//https://blog.logrocket.com/using-cors-next-js-handle-cross-origin-requests/
//

const PROTOTYPE_ID = 'PROTOTYPE_ID';

export async function GET( request, response ) {

  const values = {
    [PROTOTYPE_ID]: null
  };

  const params = request.nextUrl.searchParams;
  if (params.has(URL_PROTOTYPE_PARAM_ID)) {
    const id = params.get(URL_PROTOTYPE_PARAM_ID);
    values[PROTOTYPE_ID] = id;
  }

  const protoSupa = await supabase
  .from( 'project_archive' )
  .select( 'snapshot' )
  .eq( 'url_id', values[PROTOTYPE_ID] )
  .limit( 1 );

  const proto = protoSupa.data[0];

  //i guess this is how to handle CORS?!!?
  // const resHeaders = middleware( request );
  const resJson = NextResponse.json( proto.snapshot ); // resHeaders.headers );
  return resJson;
};


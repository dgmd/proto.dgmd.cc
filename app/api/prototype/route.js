import {
  NextResponse
} from 'next/server';

import {
  getApiCoriHeaders
} from '../../../utils/coriHeaders.js';
import {
  supabase
} from '../../../utils/supa.js';
import {
  URL_PROTOTYPE_PARAM_ID
} from './keys.js';

//
//https://github.com/vercel/next.js/discussions/47933#discussioncomment-6197807
//
//https://blog.logrocket.com/using-cors-next-js-handle-cross-origin-requests/
//

const PROTOTYPE_ID = 'PROTOTYPE_ID';

const SNAPSHOT_TIMESTAMP = 'SNAPSHOT_TIMESTAMP';

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
  .select( 'snapshot, created_at' )
  .eq( 'url_id', values[PROTOTYPE_ID] )
  .limit( 1 );

  const proto = protoSupa.data[0];
  proto.snapshot[SNAPSHOT_TIMESTAMP] = proto['created_at'];

  const resJson = NextResponse.json(
    proto.snapshot
  );

  const headersList = getApiCoriHeaders( request );
  for (const header of headersList) {
    resJson.headers.set( header[0], header[1] );
  }

  return resJson;
};


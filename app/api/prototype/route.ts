import {
  NextResponse
} from 'next/server';

import {
  supabase
} from 'utils/supa.js';

export const URL_PROTOTYPE_PARAM_ID = 'i';
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

  return NextResponse.json( proto.snapshot );
};
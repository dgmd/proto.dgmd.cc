import {
  NextResponse
} from 'next/server';

export async function GET( request ) {

  console.log( 'oh rly' );

  // const params = request.nextUrl.searchParams;
  // if (params.has(URL_PROTOTYPE_PARAM_ID)) {
  //   const id = params.get(URL_PROTOTYPE_PARAM_ID);
  //   values[PROTOTYPE_ID] = id;
  // }

  // const protoSupa = await supabase
  // .from( 'project_archive' )
  // .select( 'snapshot, created_at' )
  // .eq( 'url_id', values[PROTOTYPE_ID] )
  // .limit( 1 );

  // const proto = protoSupa.data[0];
  // proto.snapshot[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP] = proto['created_at'];

  // const resJson = NextResponse.json(
  //   proto.snapshot
  // );

  // const headersList = getApiCoriHeaders( request );
  // for (const header of headersList) {
  //   resJson.headers.set( header[0], header[1] );
  // }

  return NextResponse.json( {} );
};


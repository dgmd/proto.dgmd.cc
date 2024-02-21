export const maxDuration = 300;

import {
  NextResponse
} from 'next/server';

export async function GET( request ) {
  const rjson = {
  };

  return NextResponse.json( rjson );
};

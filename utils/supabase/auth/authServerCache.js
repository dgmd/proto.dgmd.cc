"use server"

import {
  cookies
} from 'next/headers';
import {
  cache
} from 'react';

import {
  createClient
} from '../server.js';
import {
  KEY_AUTH_CONTEXT_USER
} from './authKeys.js';

export const getAuthServerCache = cache( async () => {
  const cookieStore = cookies();
  const supabase = await createClient( cookieStore );
  try {
    const auth = await supabase.auth.getUser();
    if (auth.error) {
      auth.error = true; //auth.error.toString();
    }
    return { [KEY_AUTH_CONTEXT_USER]: auth };
  }
  catch (err) {
  }
  return { [KEY_AUTH_CONTEXT_USER]: null };
});
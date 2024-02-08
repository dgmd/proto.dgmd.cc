"use server"

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  cookies
} from 'next/headers';
import {
  cache
} from 'react';

import {
  KEY_AUTH_CONTEXT_USER
} from './authKeys.js';

export const getAuthServerCache = cache( async () => {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
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
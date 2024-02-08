"use server"

import {
  KEY_AUTH_CONTEXT_USER
} from '@/utils/auth/authKeys.js';
import {
  createClient
} from '@/utils/supabase/server.js';
import {
  cookies
} from 'next/headers';
import {
  cache
} from 'react';

export const getAuthServerCache = cache( async () => {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const auth = await supabase.auth.getUser();
    return { [KEY_AUTH_CONTEXT_USER]: auth };
  }
  catch (err) {
  }
  return { [KEY_AUTH_CONTEXT_USER]: null };
});
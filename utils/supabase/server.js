import {
  createServerClient
} from '@supabase/ssr';
import {
  cookies
} from 'next/headers';

export const createClient = () => {

  // const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_KEY,
    {
      cookies: {
        get(name) {
          return cookies().get(name)?.value
        },
        set(name, value, options) {
          cookies().set({ name, value, ...options })
        },
        remove(name, options) {
          cookies().set({ name, value: '', ...options })
        },
      },
    }
  )
};
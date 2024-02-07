import {
  createServerClient
} from '@supabase/ssr';

export function createClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
};
import { createServerClient } from '@supabase/ssr';

export const createClient = async (cookieStore) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_URL,
    process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_KEY,
    {
      cookies: {
        async get(name) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
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
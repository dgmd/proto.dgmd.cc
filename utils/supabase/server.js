import {
  createServerClient
} from '@supabase/ssr';

export const createClient = async ( cookieStore ) => {

  return await createServerClient(
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
//
//https://supabase.com/docs/guides/auth/quickstarts/react
//  

import {
  createClient
} from '@supabase/supabase-js';
  
export const supabase = createClient(
  process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_KEY
  );

// export const supabase = createClient(
//   `${ process.env.REACT_APP_SUPABASE_URL }`, 
//   `${ process.env.REACT_APP_SUPABASE_KEY }`
// );
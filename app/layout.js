"use server"

import 'app/globals.css';

import {
    AuthContextProvider
} from '@/utils/supabase/auth/authContextProvider.js';
import {
    getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';

export default async function Page({ children }) {
  const auth = await getAuthServerCache();

  return (
    <AuthContextProvider
      auth={ auth }
    >
      <html lang="en">
        <body>
          { children }
        </body>
      </html>
    </AuthContextProvider>
  );
}

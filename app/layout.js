"use server"

import 'app/globals.css';

import {
  AuthContextProvider
} from '@/utils/auth/authContextProvider.js';
import {
  getAuthServerCache
} from '@/utils/auth/authServerCache.js';

export default async function Page({ children }) {
  const {error, data} = await getAuthServerCache();

  return (
    <AuthContextProvider
      auth={ data }
    >
      <html lang="en">
        <body>
          { children }
        </body>
      </html>
    </AuthContextProvider>
  );
}

"use server"

import {
  Header
} from "components/header.jsx";
import {
  cookies
} from 'next/headers';

import {
  createClient
} from '../../utils/supabase/server.js';
import {
  AuthContextProvider
} from '../authContextProvider.js';

export default async function Layout({ children }) {

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  return (
    <div
      className={ `min-h-screen flex flex-col` }
    >
      <AuthContextProvider
        auth={ data }
      >
        <Header/>
        <div 
          className="flex-grow w-100 h-100 flex items-stretch justify-center items-center">
          { children }
        </div>
      </AuthContextProvider>
    </div>
  );
};
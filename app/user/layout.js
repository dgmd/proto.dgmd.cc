"use server"

import {
  Header
} from "components/header.jsx";
import {
  cookies
} from 'next/headers';
import {
  redirect
} from 'next/navigation';

import {
  createClient
} from '../../utils/supabase/server.js';
import {
  AuthContextProvider
} from '../authContextProvider.js';
import {
  getAuthUser
} from '../authContextUtils.js';

export default async function Layout({ children }) {

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (getAuthUser(data)) {
    console.log( 'User is authenticated' );
  }

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
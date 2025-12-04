"use client"

import {
  buttonClassNames
} from '@/components/look.js';

import {
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGNED_OUT,
  useAuthentication
} from '@/hooks/AuthenticationHook.js';

import {
  useRouter
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useState
} from 'react';

const SignIn = () => {

  const router = useRouter();

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication( );

  useEffect(() => {
    if (authSessionState === AUTH_STATE_SIGNED_IN) {
      router.push("/user/");
    }
  }, [
    authSessionState
  ]);

  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );

  const cbChangeEmail = ( event ) => {
    setEmail( x => event.target.value );
  };

  const cbChangePassword = ( event ) => {
    setPassword( x => event.target.value );
  };

  const cbSignIn = useCallback( event => {
  try{
   const signInWithEmail = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      } );
    }
    signInWithEmail();
  } catch( error ) {
    console.log( 'good morning error', error );
  }
  }, [
    email,
    password
  ] )
  
  return (
    <div
      className={
        supaUiReady && authSessionState === AUTH_STATE_SIGNED_OUT ? "visible" : "invisible"
      }
    >
    {

      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div
          className="mb-4"
        >
          <label
            htmlFor="username"
            className="block text-gray-600 text-sm font-medium mb-2">
              Username:
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
            id="username"
            onChange={ cbChangeEmail }
          />
        </div>

        <div
          className='mb-4'
        >
          <label
            htmlFor="pass"
            className="block text-gray-600 text-sm font-medium mb-2">
              Password:
            </label>
          <input
            type="password"
            id="pass"
            onChange={ cbChangePassword }
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
          />
        </div>

        <input
          className={ buttonClassNames }
          type="button"
          value="Sign In"
          onClick={ cbSignIn }
        />
      </div>

    }
    </div>
  );

};

export default SignIn;
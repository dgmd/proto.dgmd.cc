"use client"

import {
  useEffect
} from "react";

import {
  Auth
} from "@supabase/auth-ui-react";

import {
  useRouter
} from "next/navigation";

import {
  useAuthentication,
  AUTH_EVENT_PASSWORD_RECOVERY
} from '@/hooks/AuthenticationHook.js';

function Reset( ) {

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication( );

  const router = useRouter( );

  useEffect( () => {
    if (authEvent && authEvent != AUTH_EVENT_PASSWORD_RECOVERY) {
      router.push('/user/');
    }
  }, [
    authEvent
  ] );

  return (
    <div
      className={
        supaUiReady ? "visible" : "invisible"
      }
    >
      { authEvent === AUTH_EVENT_PASSWORD_RECOVERY && 
        <Auth
          supabaseClient={ supabase } 
          view="update_password" /> 
      }
    </div>
  );
}

// 

export default Reset;
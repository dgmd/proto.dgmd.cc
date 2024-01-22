"use client"

import {
  Auth
} from "@supabase/auth-ui-react";
import {
  AUTH_EVENT_PASSWORD_RECOVERY,
  useAuthentication
} from 'hooks/AuthenticationHook.js';
import {
  useRouter
} from "next/navigation";
import {
  useEffect
} from "react";

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
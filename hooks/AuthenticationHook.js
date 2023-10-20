
import {
  useEffect,
  useState
} from 'react';

import {
  supabase
} from 'utils/supa.js';

export const AUTH_EVENT_USER_UPDATED = 'USER_UPDATED';
export const AUTH_EVENT_INITIAL_SESSION = 'INITIAL_SESSION';
export const AUTH_EVENT_PASSWORD_RECOVERY = 'PASSWORD_RECOVERY';

export const AUTH_STATE_UNKNOWN = 'AUTH_STATE_UNKNOWN';
export const AUTH_STATE_SIGNED_IN = 'AUTH_STATE_SIGNED_IN';
export const AUTH_STATE_SIGNED_OUT = 'AUTH_STATE_SIGNED_OUT';

export const useAuthentication = ( ) => {

  const [authEvent, setAuthEvent] = useState( null );
  const [authSession, setAuthSession] = useState( null );
  const [authSessionState, setAuthSessionState] = useState( AUTH_STATE_UNKNOWN );
  const [supaUIMaybeReady, setSupaUIMaybeReady] = useState( false );

  useEffect( () => {
    setSupaUIMaybeReady(true);

    supabase.auth.getSession().then( authInfo => {
      const error = authInfo.error;
      const data = authInfo.data;
      if (error) {
        setAuthSessionState( AUTH_STATE_SIGNED_OUT );
        setAuthSession( null );
      }
      else {
        const session = data.session;
        setAuthSessionState( session ? AUTH_STATE_SIGNED_IN : AUTH_STATE_SIGNED_OUT );
        setAuthSession( session );
      }
    });

    const authInfo = supabase.auth.onAuthStateChange( (event, session) => {
      setAuthEvent( event );
      setAuthSessionState( session ? AUTH_STATE_SIGNED_IN : AUTH_STATE_SIGNED_OUT );
      setAuthSession( session );
    });
    const session = authInfo.data.session

    return () => {
      if (session) {
        session.unsubscribe();
      }
    };
  }, 
  [
  ] );

  return [
    authSessionState,
    authSession,
    authEvent,
    supabase,
    supaUIMaybeReady
  ];

};

export const getUserId = ( authSession ) => {
  if ( !authSession ) {
    return null;
  }
  return authSession['user']['id'];
};

export const getUserEmail = ( authSession ) => {
  if ( !authSession ) {
    return null;
  }
  return authSession['user']['email'];
};
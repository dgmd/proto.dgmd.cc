"use client"

import 'app/globals.css';

import {
  buttonClassNames
} from 'components/look.js';

import {
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGNED_OUT,
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  useRouter
} from "next/navigation";

import {
  useCallback,
  useState,
  useEffect,
  use
} from 'react';

const Search = () => {

  const router = useRouter();

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication( );


  const [groupName, setGroupName] = useState( "" );
  const [notionUserId, setNotionUserId] = useState( "" );

  const cbChangeNotionUserId = useCallback( event => {
    setNotionUserId( x => event.target.value );
  }, [ ] );

  const cbChangeGroupName = useCallback( event => {
    setGroupName( x => event.target.value );
  }, [ ] );

  const cbSignIn = useCallback( event => {
    router.push( `/group/${ groupName }/${ notionUserId }/` );
  }, [
    notionUserId,
    groupName,
    router
  ] );

  return (
    <div>
    {

      <div className="bg-white p-8 rounded-lg shadow-md w-96">

        <div
          className="mb-4"
        >
          <label
            htmlFor="group-name"
            className="block text-gray-600 text-sm font-medium mb-2">
              Group Name:
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
            id="group-name"
            onChange={ cbChangeGroupName }
          />
        </div>

        <div
          className="mb-4"
        >
          <label
            htmlFor="user-id"
            className="block text-gray-600 text-sm font-medium mb-2">
              Notion User Id:
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
            id="user-id"
            onChange={ cbChangeNotionUserId }
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

export default Search;
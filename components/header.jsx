
import Link from 'next/link';

import {
  buttonClassNames
} from 'components/look.js';

import {
  UserCircleIcon
} from '@heroicons/react/20/solid';

import {
  NotionToFramerLogo
} from '/components/logo.jsx';

import {
  Fragment
} from 'react'

import {
  Menu,
  Transition
} from '@headlessui/react'

import {
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGNED_OUT,
  getUserEmail,
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  classNames
} from 'utils/jsx.js';

export const Header = (props) => {

  const pShowUser = props.showUser;
  const pShowAdmin = props.showAdmin;

  const [    
    authSessionState,
    authSession,
    authEvent,
    supabase,
    supaUIMaybeReady
  ] = useAuthentication();

  return (
    <div className="bg-white max-h-20 z-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link 
            href="/" 
            className="-m-1.5 p-1.5">
            <NotionToFramerLogo
              // className="h-12 w-auto text-indigo-600"
              // alt="DGMD"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-x-6">

        {
        (pShowUser && authSessionState === AUTH_STATE_SIGNED_OUT) && (

          <Link
            href="/user/signin">

            <button
              type="button"
              className={ buttonClassNames }
            >
              <UserCircleIcon
                className="-mr-0.5 h-5 w-5"
                aria-hidden="true"
              />
              {
                <span>Sign In</span>
              }
            </button>

          </Link>

        )}

        {
        (pShowUser && authSessionState === AUTH_STATE_SIGNED_IN) && (

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <UserCircleIcon
                className="-mr-0.5 h-5 w-5"
                aria-hidden="true"
              />
              {
                <span>{ getUserEmail(authSession) }</span>
              }
            </Menu.Button>

            <Transition
              as={ Fragment }
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
            <Menu.Items
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-indigo-200 focus:outline-none">
              
              <div className="py-1">
                
                {
                pShowAdmin &&
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href='/user'
                      className= { classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ) }
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </Menu.Item>
                }

                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-sm'
                      )}
                      onClick={ e => supabase.auth.signOut() }
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>

              </div>

            </Menu.Items>
            </Transition>
          </Menu>
        )}

      </div>
    </div>
  </div>
  );
};

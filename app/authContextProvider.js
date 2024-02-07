'use client'

import {
  createContext
} from 'react';

import {
  KEY_AUTH_CONTEXT_USER
} from './authContextKeys.js';

export const AuthContext = createContext({
  [KEY_AUTH_CONTEXT_USER]: null
});
 
export const AuthContextProvider = ({ children, auth }) => {
  return (
    <AuthContext.Provider
      value={ { [KEY_AUTH_CONTEXT_USER]: auth } }
    >
      { children }
    </AuthContext.Provider>
  );
};
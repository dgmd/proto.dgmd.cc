'use client'

import {
  createContext
} from 'react';

import {
  KEY_AUTH_CONTEXT_USER
} from './authKeys.js';

export const AuthContext = createContext({
  [KEY_AUTH_CONTEXT_USER]: null
});
 
export const AuthContextProvider = ({ children, auth }) => {
  return (
    <AuthContext.Provider
      value={ auth }
    >
      { children }
    </AuthContext.Provider>
  );
};
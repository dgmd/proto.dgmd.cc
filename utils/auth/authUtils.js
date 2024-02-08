import {
  isNil
} from 'lodash-es';

import {
  KEY_AUTH_CONTEXT_USER
} from './authKeys.js';

export const getAuthUser = (auth) => {
  if (auth && auth[KEY_AUTH_CONTEXT_USER]) {
    return auth[KEY_AUTH_CONTEXT_USER].user;
  }
  return null;
};

export const isAuthUser = (auth) => {
  return !isNil(getAuthUser(auth));
};
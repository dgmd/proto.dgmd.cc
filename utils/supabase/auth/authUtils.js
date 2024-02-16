import {
  isNil
} from 'lodash-es';

import {
  KEY_AUTH_CONTEXT_USER
} from './authKeys.js';

export const getAuthUser = (auth) => {
  if (auth) {
    const ctx = auth[KEY_AUTH_CONTEXT_USER];
    if (ctx) {
      const data = ctx['data'];
      if (data) {
        return data['user'];
      }
    }
  }
  return null;
};

export const isAuthUser = (auth) => {
  return !isNil(getAuthUser(auth));
};

export const getAuthId = (authUser) => {
  return authUser['id'];
};
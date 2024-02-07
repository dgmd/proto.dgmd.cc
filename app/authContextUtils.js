import {
  KEY_AUTH_CONTEXT_USER
} from './authContextKeys.js';

export const getAuthUser = (auth) => {
  if (auth && auth[KEY_AUTH_CONTEXT_USER]) {
    return auth[KEY_AUTH_CONTEXT_USER].user;
  }
  return null;
};
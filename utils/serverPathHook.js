"use server"

import {
  headers
} from 'next/headers';

export const useServerPath = () => {
  const headersList = headers();
  const requestedUrlString = headersList.get('referer');
  return new URL( requestedUrlString );
};
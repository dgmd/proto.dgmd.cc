import {
  useCallback
} from 'react';

export const useServerSignOut = () => {
  const onSignOut = useCallback( async () => {
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST'
    });
    if (response.ok) {
      window.location.href = '/';
    }
  }, [] );

  return onSignOut;
};


import {
  URL_SEARCH_PARAM_BLOCKS_REQUEST,
  URL_SEARCH_PARAM_DATABASE,
  URL_SEARCH_PARAM_RELATIONS_REQUEST
} from 'app/api/query/keys.js';
import {
  useCallback,
  useRef,
  useState
} from 'react';

import {
  getTextFromReadableStream
} from '../utils/network.js';

export const FETCH_NOTION_CALLBACK = 'FETCH_NOTION_CALLBACK';
export const FETCH_NOTION_FETCHING = 'FETCH_NOTION_FETCHING';
export const FETCH_NOTION_DATA = 'FETCH_NOTION_DATA';

export const useFetchNotionData = ( ) => {

  const [ isFetching, setFetching ] = useState( s => false );
  const [ fetchNotionData, setFetchNotionData ] = useState( s => null );
  const rIsFetching = useRef( isFetching );

  const cbRequestSnapshot = useCallback( async () => {
    if (rIsFetching.current) {
      return;
    }
    rIsFetching.current = true;
    setFetching( true );

    const res = await fetch( '/api/update' );
    const resBody = res.body;
    const text = await getTextFromReadableStream( resBody );
    setFetchNotionData( s => text );

    rIsFetching.current = false;
    setFetching( false );
  }, [
  ] );

  return {
    [FETCH_NOTION_CALLBACK]: cbRequestSnapshot,
    [FETCH_NOTION_DATA]: fetchNotionData,
    [FETCH_NOTION_FETCHING]: isFetching
  };
};

export const queryApiForRoom = async( dbId ) => {
  const paramsObj = {
    [URL_SEARCH_PARAM_DATABASE]: dbId,
    [URL_SEARCH_PARAM_BLOCKS_REQUEST]: true,
    [URL_SEARCH_PARAM_RELATIONS_REQUEST]: false
  };
  const params = new URLSearchParams( paramsObj );
  const res = await fetch(
    `/api/query?${ params.toString() }`
  );
  const resBody = res.body;
  const text = await getTextFromReadableStream( resBody );
  const js = JSON.parse( text );
  return js;
};
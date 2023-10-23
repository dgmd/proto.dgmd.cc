"use client"

import 'app/globals.css';

import {
  useRef,
  useEffect,
  useState
} from "react";

import {
  useParams
} from 'next/navigation';

import Link from 'next/link';

import {
  Title
} from 'components/title';

import {
  Table,
  TABLE_HEADER_NAME,
  TABLE_HEADER_HIDE
} from 'components/table.jsx';

import {
  URL_SEARCH_PARAM_DATABASE,
  URL_SEARCH_PARAM_BLOCKS_REQUEST,
  URL_SEARCH_PARAM_RELATIONS_REQUEST,

  NOTION_RESULT
} from 'app/api/query/route.ts';

import {
  getTextFromReadableStream
} from 'utils/network.js';

import {
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  buttonClassNames,
  cellClassNames
} from '/components/look.js';

import {
  ArrowPathIcon
} from '@heroicons/react/20/solid';

import {
  ClipboardButton
} from 'components/clipboard-button.jsx';

import {
  LinkButton
} from 'components/link-button.jsx';

const PROTO_TYPE = 'PROTO_TYPE';
const PROTO_VAL = 'PROTO_VAL';
const PROTO_DATE = 'PROTO_DATE';
const PROTO_LINK = 'PROTO_LINK';

export default function Page() {

  const params = useParams( );
  const pNotionUserId = params['notion-user-id'];
  const pGroupName = params['group-name'];
  const pDatabaseId = params[ 'database-id' ];

  const [loading, setLoading] = useState( x => false );
  const rLoading = useRef( loading );

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication();

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: 'date', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'link', [TABLE_HEADER_HIDE]: null }
  ] );
  const [rows, setRows] = useState( x => [] );

  const fetchData = async ( initial ) => {
    if (rLoading.current) {
      return;
    }

    setLoading( x => true );
    rLoading.current = true;

    //try to load in what we got here already
    const timeStampsSupa = await supabase
    .from( 'project_archive' )
    .select( 'created_at, url_id')
    .order( 'created_at', { ascending: false } )
    .eq( 'prototype_id', pDatabaseId );

    if (timeStampsSupa.data.length === 0 || !initial) {

      const snapshot = await queryApiForProject( pDatabaseId );
      const snapshotData = snapshot[NOTION_RESULT];
      
      const insertSupa = await supabase
      .from( 'project_archive' )
      .insert({ 
        'prototype_id': pDatabaseId,
        'snapshot': snapshotData 
      })
      .select( 'created_at, url_id' )
      .order( 'created_at', { ascending: false } )
      .eq( 'prototype_id', pDatabaseId );

      const timeStampsSupa = await supabase
      .from( 'project_archive' )
      .select( 'created_at, url_id')
      .order( 'created_at', { ascending: false } )
      .eq( 'prototype_id', pDatabaseId );
      const irows = getRows( timeStampsSupa.data );
      setRows( r => irows );
    }
    else {
      const irows = getRows( timeStampsSupa.data );
      setRows( r => irows );
    }

    setLoading( x => false );
    rLoading.current = false;
  };

  useEffect( () => {
    fetchData( true );
  }, [
    pGroupName,
    supabase
  ] );

  return (
    <div className='flex-grow'>  
      <Title
        title={ 'Database' }
      >
        {
        rows.length > 0 &&
        <button
          className={ buttonClassNames + " mt-2" }
          onClick={ () => fetchData(false) }>
          Grab New Snapshot
          <ArrowPathIcon
            className={ `h-5 w-5 pointer-events-none ${ loading ? `animate-spin` : `` }` }
            aria-hidden="true" />
        </button>
        }
      </Title>

      <div
        className="flex flex-col grow sm:px-6 lg:px-8"
      >
        <Table
          headers={ headers }
        >
          {
            rows.map( (row, idx) => {
              const elements = [];
              if (row[PROTO_TYPE] === PROTO_DATE) {
                elements.push(
                  <div
                    className={ cellClassNames }
                  >
                    { row[PROTO_VAL] }
                  </div>
                );
              }
              else if (row[PROTO_TYPE] === PROTO_LINK) {
                elements.push(
                  <div
                    className={ `${ cellClassNames } flex flex-row gap-2` }
                  >
                    <ClipboardButton
                      text={ `${ window.location.origin }${ row[PROTO_VAL] }` }
                    />
                    <LinkButton
                      link={ row[PROTO_VAL] }
                    />
                  </div>
                );
              }
              return elements;
            } )
          }
        </Table>
      </div>
    </div>
  );
};

const queryApiForProject = async( dbId ) => {
  const paramsObj = {
    [URL_SEARCH_PARAM_DATABASE]: dbId,
    [URL_SEARCH_PARAM_BLOCKS_REQUEST]: false,
    [URL_SEARCH_PARAM_RELATIONS_REQUEST]: true
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

const getRows = ( rows ) => {
  return rows.reduce( (acc, cur) => {
    acc.push( {
      [PROTO_TYPE]: PROTO_DATE,
      [PROTO_VAL]: cur.created_at
    } );
    acc.push( {
     [PROTO_TYPE]: PROTO_LINK,
     [PROTO_VAL]: `/api/prototype?i=${cur.url_id}`
    } );
    return acc;
  }, [] );
};
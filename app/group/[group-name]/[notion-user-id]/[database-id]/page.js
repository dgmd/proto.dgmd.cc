"use client"

import 'app/globals.css';

import {
  ArrowPathIcon
} from '@heroicons/react/20/solid';
import {
  URL_PROTOTYPE_PARAM_ID
} from 'app/api/prototype/keys.js';
import {
  NOTION_RESULT,
  NOTION_RESULT_BLOCK_DBS,
  NOTION_RESULT_BLOCK_KEY,
  PARAM_BLOCKS_REQUEST,
  PARAM_DATABASE,
  PARAM_RELATIONS_REQUEST,
  QUERY_RESPONSE_KEY_DATA_KEY,
  QUERY_RESPONSE_KEY_DATA_VALUE,
  QUERY_RESPONSE_KEY_PRIMARY_DATABASE
} from 'app/api/query/keys.js';
import {
  ClipboardButton
} from 'components/clipboard-button.jsx';
import {
  LinkButton
} from 'components/link-button.jsx';
import {
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from 'components/table.jsx';
import {
  Title
} from 'components/title';
import {
  QUERY_RESPONSE_KEY_BLOCKS,
} from 'constants.dgmd.cc';
import {
  useAuthentication
} from 'hooks/AuthenticationHook.js';
import {
  useParams
} from 'next/navigation';
import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  getTextFromReadableStream
} from 'utils/network.js';
import {
  buttonClassNames,
  cellClassNames
} from '/components/look.js';

import { QUERY_RESPONSE_KEY_DATA_METADATA, QUERY_RESPONSE_KEY_DATA_PROPERTIES } from '../../../../api/query/keys';

const PROTO_TYPE = 'PROTO_TYPE';
const PROTO_VAL = 'PROTO_VAL';
const PROTO_DATE = 'PROTO_DATE';
const PROTO_LINK = 'PROTO_LINK';

export default function Page() {

  const params = useParams( );
  const pNotionUserId = decodeURI( params['notion-user-id'] );
  const pGroupName = decodeURI( params['group-name'] );
  const pDatabaseId = decodeURI( params[ 'database-id' ] );

  const [databaseName, setDatabaseName] = useState( x => '' );
  const [notionUserName, setNotionUserName] = useState( x => '' );

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
    { [TABLE_HEADER_NAME]: 'Snapshot', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'LINKS', [TABLE_HEADER_HIDE]: null }
  ] );
  const [rows, setRows] = useState( x => getRows( [], getLiveDataLink(pDatabaseId) ) );

  const fetchTitle = async() => {
    const roomSupa = await supabase
    .from( 'notion_rooms' )
    .select( 'id' )
    .eq( 'name', pGroupName  );

    const roomDataSupa = await supabase
    .from( 'notion_rooms_data' )
    .select( 'data' )
    .order( 'created_at', { ascending: false } )
    .eq( 'notion_table', roomSupa.data[0].id );

    const json = roomDataSupa.data[0].data;
    const blocks = json[QUERY_RESPONSE_KEY_BLOCKS];
    const block = blocks.find(
      block => block[NOTION_RESULT_BLOCK_KEY] === pNotionUserId );
    const blockDbs = block[NOTION_RESULT_BLOCK_DBS];
    const blockIdx = blockDbs.findIndex( x => x[QUERY_RESPONSE_KEY_DATA_KEY] === pDatabaseId );
    const blockVal = blockDbs[blockIdx][QUERY_RESPONSE_KEY_DATA_VALUE];
    setDatabaseName( x => blockVal );

    const userBlock = json[QUERY_RESPONSE_KEY_PRIMARY_DATABASE][QUERY_RESPONSE_KEY_BLOCKS].find( x => {
      return x[QUERY_RESPONSE_KEY_DATA_METADATA]['id'][QUERY_RESPONSE_KEY_DATA_VALUE] === pNotionUserId;
    } );
    const title = userBlock[QUERY_RESPONSE_KEY_DATA_PROPERTIES]['Name'][QUERY_RESPONSE_KEY_DATA_VALUE];
    setNotionUserName( x => title );
  };

  const fetchData = async ( initial ) => {
    if (rLoading.current) {
      return;
    }

    setLoading( x => !initial );
    rLoading.current = true;

    //try to load in what we got here already
    const timeStampsSupa = await supabase
    .from( 'project_archive' )
    .select( 'created_at, url_id')
    .order( 'created_at', { ascending: false } )
    .eq( 'prototype_id', pDatabaseId );

    if (!initial) {

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
      const irows = getRows( timeStampsSupa.data, getLiveDataLink(pDatabaseId) );
      setRows( r => irows );
    }
    else {
      const irows = getRows( timeStampsSupa.data, getLiveDataLink(pDatabaseId) );
      setRows( r => irows );
    }

    setLoading( x => false );
    rLoading.current = false;
  };

  useEffect( () => {
    fetchTitle( );
    fetchData( true );
  }, [
  ] );

  // if (true) {
  //   return "loading..."
  // }

  return (
    <div className='flex-grow'>  
      <Title
      >
        {
        rows.length > 0 &&
        <div
          className="flex flex-col gap-8 pt-8">
          <div
            className='grid grid-cols-2 gap-2'
          >
            <div
              className='w-32'
            >DATABASE</div>
            <div>{databaseName}</div>
            <div>NOTION USER</div>
            <div>{notionUserName}</div>
            <div>GROUP</div>
            <div>{pGroupName}</div>
          </div>
          <button
            className={ buttonClassNames + " mt-2" }
            onClick={ () => fetchData( false ) }>
            Grab New Snapshot
            <ArrowPathIcon
              className={ `h-5 w-5 pointer-events-none ${ loading ? `animate-spin` : `` }` }
              aria-hidden="true" />
          </button>
        </div>
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
  const link = getLiveDataLink( dbId );
  const res = await fetch( link );
  const resBody = res.body;
  const text = await getTextFromReadableStream( resBody );
  const js = JSON.parse( text );
  return js;
};

const getRows = ( rows, liveDataLink ) => {

  return rows.reduce( (acc, cur) => {
    acc.push( {
      [PROTO_TYPE]: PROTO_DATE,
      [PROTO_VAL]: cur.created_at
    } );
    acc.push( {
     [PROTO_TYPE]: PROTO_LINK,
     [PROTO_VAL]: `/api/prototype?${ URL_PROTOTYPE_PARAM_ID }=${ cur.url_id }`
    } );
    return acc;
  }, [
    {
      [PROTO_TYPE]: PROTO_DATE,
      [PROTO_VAL]: 'LIVE DATA'
    },
    {
      [PROTO_TYPE]: PROTO_LINK,
      [PROTO_VAL]: liveDataLink
    }

  ] );
};

const getLiveDataLink = dbId => {
  const paramsObj = {
    [PARAM_DATABASE]: dbId,
    [PARAM_BLOCKS_REQUEST]: false,
    [PARAM_RELATIONS_REQUEST]: true
  };
  const params = new URLSearchParams( paramsObj );
  return `/api/query?${ params.toString() }`;
};
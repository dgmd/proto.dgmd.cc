"use client"

import 'app/globals.css';

import {
  useCallback,
  useEffect,
  useState,
  useRef
} from "react";

import {
  useParams
} from 'next/navigation';

import {
  Title
} from 'components/title';

import {
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from 'components/table.jsx';

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
  EXPORT_DATA_METADATA,
  EXPORT_DATA_PROPERTIES,
  EXPORT_DATA_KEY,
  EXPORT_DATA_VALUE,
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_BLOCK_DBS,
  NOTION_RESULT_BLOCK_KEY,
  NOTION_RESULT_PRIMARY_DATABASE,

  NOTION_RESULT,
  NOTION_RESULT_SUCCESS
} from 'app/api/query/keys.js';

import {
  ClipboardButton
} from 'components/clipboard-button.jsx';

import {
  LinkButton
} from 'components/link-button.jsx';

import {
  queryApiForRoom
} from 'hooks/FetchNotionDataHook.js';


const PROJECT_TYPE = 'PROJECT_TYPE';
const PROJECT_VAL = 'PROJECT_VAL';
const PROJECT_NAME = 'PROJECT_NAME';
const PROJECT_ID = 'PROJECT_ID';

export default function Page() {

  const params = useParams( );
  const pGroupName = decodeURI( params[ 'group-name' ] );
  const pNotionUserId = decodeURI( params[ 'notion-user-id' ] );

  const [notionUserName, setNotionUserName] = useState( x => '' );

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication();

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: 'database name', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'database link', [TABLE_HEADER_HIDE]: null }
  ] );
  const [rows, setRows] = useState( x => [] );

  const [loading, setLoading] = useState( x => false );
  const rLoading = useRef( loading );

  const fetchData = async () => {
    try {
      //try to load in what we got here already
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
      const data = json[NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS];
      const datum = data.find( x => {
        return x[EXPORT_DATA_METADATA]['id'][EXPORT_DATA_VALUE] === pNotionUserId;
      } );
      const name = datum[EXPORT_DATA_PROPERTIES]['Name'][EXPORT_DATA_VALUE];
      setNotionUserName( x => name );

      const blocks = json[NOTION_RESULT_BLOCKS];
      const block = blocks.find(
        block => block[NOTION_RESULT_BLOCK_KEY] === pNotionUserId );
      const blockDbs = block[NOTION_RESULT_BLOCK_DBS];

      const rowData = blockDbs.reduce( (acc, cur) => {
        acc.push(
          {
            [PROJECT_TYPE]: PROJECT_NAME,
            [PROJECT_VAL]: cur[EXPORT_DATA_VALUE]
          },
          {
            [PROJECT_TYPE]: PROJECT_ID,
            [PROJECT_VAL]: cur[EXPORT_DATA_KEY]
          }
        );
        return acc;
      }, [] );
      setRows( x => rowData );

    }
    catch (e) {
      console.log( e );
    }

    setLoading( x => false );
  };

  useEffect( () => {
    if (rLoading.current) {
      return;
    }
    setLoading( x => true );
    fetchData();
  }, [
  ] );

  const cbRefresh = useCallback( async() => {
    if (rLoading.current) {
      return;
    }
    rLoading.current = true;
    setLoading( x => true );

    try {
      const supaRoomId = await supabase
      .from( 'notion_rooms' )
      .select( 'notion_db_id, id' )
      .eq( 'name', pGroupName  );
      const roomData = supaRoomId.data[0];
      const roomNotionDbId = roomData.notion_db_id;
      const roomNotionId = roomData.id;
      console.log( 'roomNotionDbId', roomNotionDbId, roomNotionId );

      const js = await queryApiForRoom( roomNotionDbId );
      console.log( 'js', js );
      if (js && js[NOTION_RESULT_SUCCESS]) {
        const result = js[NOTION_RESULT];

        const insertDataSupa = 
        await supabase
        .from( 'notion_rooms_data' )
        .insert( {
          'notion_table': roomNotionId,
          'data': result
        } );
      }
    }
    catch (e) {
      console.log( e );
    }

    rLoading.current = false;
    setLoading( x => false );
    fetchData();
  }, [
    pGroupName
  ] );

  if ( !notionUserName ) {
    return null;
  }

  return (
    <div className='flex-grow'>  

      <Title
        title={ notionUserName }
        subtitle={ `notion user id: ${ pNotionUserId }` }
      >
        {
        // rows.length > 0 &&
        <button
          className={ buttonClassNames + " mt-2" }
          onClick={ cbRefresh }>
          Update Listings
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
              if (row[PROJECT_TYPE] === PROJECT_NAME) {
                elements.push(
                  <div
                    className={ cellClassNames }
                  >
                    { row[PROJECT_VAL] }
                  </div>
                );
              }
              else if (row[PROJECT_TYPE] === PROJECT_ID) {
                elements.push(

                  <div
                    className={ `${ cellClassNames } flex flex-row gap-2` }
                  >
                    <ClipboardButton
                      text={ `${window.location.origin}/group/${pGroupName}/${pNotionUserId}/${row[PROJECT_VAL]}` }
                    />
                    <LinkButton
                      link={ `/group/${pGroupName}/${pNotionUserId}/${row[PROJECT_VAL]}` }
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

"use client"

import 'app/globals.css';

import {
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
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  cellClassNames
} from '/components/look.js';

import {
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_BLOCK_DBS,
  NOTION_RESULT_BLOCK_KEY,
  EXPORT_DATA_KEY,
  EXPORT_DATA_VALUE
} from 'app/api/query/route.ts';

import {
  ClipboardButton
} from 'components/clipboard-button.jsx';

import {
  LinkButton
} from 'components/link-button.jsx';

const PROJECT_TYPE = 'PROJECT_TYPE';
const PROJECT_VAL = 'PROJECT_VAL';
const PROJECT_NAME = 'PROJECT_NAME';
const PROJECT_ID = 'PROJECT_ID';

export default function Page() {

  const params = useParams( );
  const pGroupName = params[ 'group-name' ];
  const pNotionUserId = params[ 'notion-user-id' ];

  const [groupName, setGroupName] = useState( x => '' );

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

  useEffect( () => {
    const fetchData = async () => {
      try {
        //try to load in what we got here already
        const roomSupa = await supabase
        .from( 'notion_rooms' )
        .select( 'name, id')
        .eq( 'name', pGroupName );
        setGroupName( x => roomSupa.data[0].name );

        const roomDataSupa = await supabase
        .from( 'notion_rooms_data' )
        .select( 'data' )
        .eq( 'notion_table', roomSupa.data[0].id );
        
        const json = roomDataSupa.data[0].data;
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
        console.log( 'error', e );
      }
    }
    fetchData();
  }, [
  ] );

  return (
    <div className='flex-grow'>  

      <Title
        title={ groupName }
        subtitle={ `student: ${pNotionUserId}` }
      >
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

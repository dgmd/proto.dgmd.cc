"use client"

import Link from 'next/link';

import 'app/globals.css';

import {
  useParams
} from 'next/navigation';

import {
  useEffect,
  useState
} from 'react';

import {
  useRouter
} from "next/navigation";

import {
  Table,
  TABLE_HEADER_NAME,
  TABLE_HEADER_HIDE
} from 'components/table.jsx';

import {
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  Title
} from '/components/title.jsx';

import {
  cellClassNames
} from '/components/look.js';

import {
  NOTION_RESULT_PRIMARY_DATABASE,
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_BLOCK_KEY,

  EXPORT_DATA_VALUE
} from 'app/api/query/route.ts';

const USER_ID = 'USER_ID';
const USER_NAME = 'USER_NAME';

export default function List() {

  const params = useParams( );
  const pGroupId = params[ 'group-id' ];

  const [groupName, setGroupName] = useState( x => '' );

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: 'student name', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'student link', [TABLE_HEADER_HIDE]: null }
  ] );
  const [rows, setRows] = useState( x => [] );

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication();

  const router = useRouter();

  useEffect( () => {
    if ( supabase ) {
      fetchData( supabase, pGroupId );
    }
  }, [
    supabase
  ] );

  const fetchData = async ( supabase, pGroupId ) => {
    const frows = [];

    try {
      const idResultSupa = await supabase
      .from( 'notion_rooms' )
      .select( 'id, name' )
      .eq( 'url_id', pGroupId );

      if (idResultSupa.data && idResultSupa.data.length > 0) {
        const dataResultSupa = await supabase
        .from( 'notion_rooms_data' )
        .select( 'data' )
        .order( 'created_at', { ascending: false } )
        .eq( 'notion_table', idResultSupa.data[ 0 ].id )
        .limit( 1 );

        if (dataResultSupa.data && dataResultSupa.data.length > 0) {
          const room = dataResultSupa.data[0].data;
          const students = room[NOTION_RESULT_PRIMARY_DATABASE];
          const blocks = room[NOTION_RESULT_BLOCKS];
          for (const student of students) {
            const studentId = student['id'][EXPORT_DATA_VALUE];
            const studentBlocks = blocks.find(
              block => block[NOTION_RESULT_BLOCK_KEY] == studentId );
            const keys = Object.keys(studentBlocks);
            if (keys.length > 0) {
              const studentName = student['Name'][EXPORT_DATA_VALUE];
              frows.push( {
                [USER_NAME]: studentName,
                [USER_ID]: studentId
              } );
            }
          }
        
          setGroupName( x => idResultSupa.data[ 0 ].name );
        }
      }
    }
    catch ( e ) {
      console.log( e );
    }

    setRows( x => frows );
  };

  //todo -- turn away if not signed in

  return (
    <div className='flex-grow'>  

      <Title
        title={ groupName }
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
              for (const [key, value] of Object.entries(row)) {
                if (key === USER_ID) {
                  elements.push(
                    <div
                      className={ cellClassNames }
                    >
                      <Link
                        href={ `/group/${ pGroupId }/${ value }`}
                      >
                        { value }
                      </Link>
                    </div>
                  )
                }
                else {
                  elements.push(
                    <div
                      className={ cellClassNames }
                    >
                    { value }
                    </div>
                  )
                }
              }
              return elements;
            } )
          }

        </Table>

      </div>
    </div>
  );
}

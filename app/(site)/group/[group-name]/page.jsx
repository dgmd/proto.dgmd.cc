"use server"

import {
  PARAM_ROSTERS_DB_ID
} from '@/api/rosters/keys';
import {
  RosterEntriesTable
} from '@/components/roster-entries-table.jsx';
import {
  Title
} from '@/components/title.jsx';
import {
  getAuthServerCache
} from '@/utils/supabase/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/supabase/auth/authUtils.js';
import {
  cookies
} from "next/headers";
import {
  redirect
} from 'next/navigation';

async function GroupName( {params} ) {
  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/');
  }

  const groupName = params[ 'group-name' ];

  const rostersUrl = new URL('/api/roster-entries', process.env.SITE_ORIGIN );
  rostersUrl.searchParams.append( PARAM_ROSTERS_DB_ID, groupName );
  const rosterData = await fetch(rostersUrl.href, {
    headers: { Cookie: cookies().toString() },
  });
  const rosterJson = await rosterData.json();

  return (
        <div className='flex-grow'>
          <Title
            title={ groupName }
          >
          </Title>
    
          <div
            className="flex flex-col grow sm:px-6 lg:px-8"
          > 
            {
            rosterJson.data &&
            <RosterEntriesTable
              data={ rosterJson.data }
            />
            }
          </div>
        </div>
  );    

};

// export default function List() {

//   const params = useParams( );
//   const pGroupName = decodeURI( params[ 'group-name' ] );

//   const [groupName, setGroupName] = useState( x => '' );

//   const [headers, setHeaders] = useState( x => [ 
//     { [TABLE_HEADER_NAME]: 'student name', [TABLE_HEADER_HIDE]: null },
//     { [TABLE_HEADER_NAME]: 'student link', [TABLE_HEADER_HIDE]: null }
//   ] );
//   const [rows, setRows] = useState( x => [] );

//   // const router = useRouter();

//   // useEffect( () => {
//   //   if ( supabase ) {
//   //     fetchData( supabase, pGroupName );
//   //   }
//   // }, [
//   //   supabase
//   // ] );

//   // const fetchData = async ( supabase, pGroupName ) => {
//   //   const frows = [];

//   //   try {
//   //     const idResultSupa = await supabase
//   //     .from( 'notion_rooms' )
//   //     .select( 'id' )
//   //     .eq( 'name', pGroupName );

//   //     if (idResultSupa.data && idResultSupa.data.length > 0) {
//   //       const dataResultSupa = await supabase
//   //       .from( 'notion_rooms_data' )
//   //       .select( 'data' )
//   //       .order( 'created_at', { ascending: false } )
//   //       .eq( 'notion_table', idResultSupa.data[ 0 ].id )
//   //       .limit( 1 );

//   //       if (dataResultSupa.data && dataResultSupa.data.length > 0) {
//   //         const room = dataResultSupa.data[0].data;
//   //         const students = room[DGMD_PRIMARY_DATABASE][DGMD_BLOCKS];
//   //         const blocks = room[DGMD_BLOCKS];
//   //         for (const student of students) {
//   //           const studentId = student[DGMD_METADATA]['id'][DGMD_VALUE];
//   //           const studentBlocks = blocks.find(
//   //             block => block[NOTION_RESULT_BLOCK_KEY] == studentId );
//   //           const keys = Object.keys(studentBlocks);
//   //           if (keys.length > 0) {
//   //             const studentName = student[DGMD_PROPERTIES]['Name'][DGMD_VALUE];
//   //             frows.push( {
//   //               [USER_NAME]: studentName,
//   //               [USER_ID]: studentId
//   //             } );
//   //           }
//   //         }
        
//   //         setGroupName( x => pGroupName );
//   //       }
//   //     }
//   //   }
//   //   catch ( e ) {
//   //     console.log( e );
//   //   }

//   //   setRows( x => frows );
//   // };

//   // useEffect( () => {
//   //   if (authSessionState === AUTH_STATE_SIGNED_OUT) {
//   //     router.push("/");
//   //   }
//   // }, [
//   //   authSessionState,
//   //   authSession,
//   //   supabase
//   // ] );

//   // if (!supaUiReady || authSessionState !== AUTH_STATE_SIGNED_IN) {
//   //   return null;
//   // }

//   return (
//     <div className='flex-grow'>
//       <Title
//         title={ groupName }
//       >
//       </Title>

//       <div
//         className="flex flex-col grow sm:px-6 lg:px-8"
//       >

//         <Table
//           headers={ headers }
//         >

//           {
//             rows.map( (row, idx) => {
//               const elements = [];
//               for (const [key, value] of Object.entries(row)) {
//                 if (key === USER_ID) {
//                   elements.push(
//                     <div
//                       className={ `${ cellClassNames } flex flex-row gap-2` }
//                     >
//                       <ClipboardButton
//                         text={ `${ window.location.origin }/group/${ pGroupName }/${ value }` }
//                       />
//                       <LinkButton
//                         link={ `/group/${ pGroupName }/${ value }` }
//                       />
//                     </div>
//                   )
//                 }
//                 else {
//                   elements.push(
//                     <div
//                       className={ cellClassNames }
//                     >
//                     { value }
//                     </div>
//                   )
//                 }
//               }
//               return elements;
//             } )
//           }

//         </Table>

//       </div>
//     </div>
//   );
// }

export default GroupName;
"use client"

import {
  ClipboardButton
} from '@/components/clipboard-button.jsx';
import {
  LinkButton
} from '@/components/link-button.jsx';
import {
  cellClassNames,
  cellHoverClassNames
} from '@/components/look.js';
import {
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from '@/components/table.jsx';
import {
  Title
} from '@/components/title.jsx';
import {
  useState
} from 'react';

const KEY_SNAPSHOT_DATE = 'snapshot date';
const KEY_SNAPSHOT_LINK = 'snapshot link';

export const ProjectTable =
  ({rosterName, userName, projectName}) => {

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_DATE, 
      [TABLE_HEADER_HIDE]: null
    },
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_LINK,
      [TABLE_HEADER_HIDE]: null
    }
  ] );

//   const [cells, setCells] = useState( x => {
//     return data.map( cur => {
//       const notionUrl = new URL( `/group/${dbId}/${cur.notion_id}`, url );
//       return {
//         [KEY_STUDENT_NAME]: cur.snapshot_name,
//         [KEY_STUDENT_LINK]: notionUrl
//       };
//     } );
//   } );

  return (
    <div className='flex-grow'>  
      <Title
        title={ projectName }
        subtitle={ `${rosterName}\u00a0/\u00a0${userName}` }
      />

      <div
        className={ `flex flex-col grow sm:px-6 lg:px-8` }
      >
        <Table
          headers={headers}
        >
        {/* {
          cells.map((row, i) => 
            headers.map((header, j) => {
              const key = header[TABLE_HEADER_NAME];
              const cell = row[key];
              const classNames = [cellClassNames, cellHoverClassNames].join(' ');
              return (
                <div key={`row-${i}-cell-${j}`}>
                  {key === KEY_STUDENT_LINK && (
                  <div className={ [cellClassNames, 'space-x-1'].join( ' ' )}>
                    <LinkButton link={row[KEY_STUDENT_LINK].pathname} />
                    <ClipboardButton text={row[KEY_STUDENT_LINK].href} />
                  </div>
                  )}
                  {key === KEY_STUDENT_NAME && (
                  <div className={classNames}>
                    { cell }
                  </div>
                  )}
                </div>
              )
            })
          )
        } */}
        </Table>
      </div>
    </div>
  )

};
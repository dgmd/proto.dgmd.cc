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

const KEY_PROJECT_LINK = 'Link';
const KEY_PROJECT_NAME = 'Name';

export const RosterEntryProjectsTable = 
  ({projectsList, userName, rosterName, rosterId, userId, url}) => {

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_PROJECT_NAME, 
      [TABLE_HEADER_HIDE]: null
    },
    { [TABLE_HEADER_NAME]: KEY_PROJECT_LINK,
      [TABLE_HEADER_HIDE]: null
    }
  ] );

  const [cells, setCells] = useState( x => {
    return projectsList.map( cur => {
      const notionUrl = new URL( `/group/${rosterId}/${userId}/${cur.PAGE_ID}`, url );
      return {
        [KEY_PROJECT_NAME]: cur.VALUE,
        [KEY_PROJECT_LINK]: notionUrl
      };
    } );
  } );

  return (
    <div className='flex-grow'>  

      <Title
        title={ userName }
        subtitle={ rosterName }
      />
      <div
        className={ `flex flex-col grow sm:px-6 lg:px-8` }
      >
        <Table
          headers={ headers }
        >
        {
          cells.map((row, i) => 
            headers.map((header, j) => {
              const key = header[TABLE_HEADER_NAME];
              const cell = row[key];
              const classNames = [cellClassNames, cellHoverClassNames].join(' ');
              return (
                <div key={`row-${i}-cell-${j}`}>
                  {key === KEY_PROJECT_LINK && (
                  <div className={ [cellClassNames, 'space-x-1'].join( ' ' )}>
                    <LinkButton link={row[KEY_PROJECT_LINK].pathname} />
                    <ClipboardButton text={row[KEY_PROJECT_LINK].href} />
                  </div>
                  )}
                  {key === KEY_PROJECT_NAME && (
                  <div className={classNames}>
                    { cell }
                  </div>
                  )}
                </div>
              )
            })
          )
        }
        </Table>
      </div>
    </div>
  );

};

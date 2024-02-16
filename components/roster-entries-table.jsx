"use client"

import {
  buttonClassNames,
  cellClassNames,
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from '@/components/look.js';
import {
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from '@/components/table.jsx';
import {
  useState
} from 'react';

const KEY_STUDENT_NAME = 'student name';
const KEY_STUDENT_LINK = 'student link';

export const RosterEntriesTable = ({data}) => {

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_STUDENT_NAME, 
      [TABLE_HEADER_HIDE]: null
    },
    { [TABLE_HEADER_NAME]: KEY_STUDENT_LINK,
      [TABLE_HEADER_HIDE]: null
    }
  ] );

  const [cells, setCells] = useState( x => {
    return data.map( cur => {
      return {
        [KEY_STUDENT_NAME]: cur.snapshot_name,
        [KEY_STUDENT_LINK]: ''
      };
    } );
  } );

  return (
    <Table
      headers={headers}
    >
    {
      cells.map((row, i) => 
      headers.map((header, j) => {
        const key = header[TABLE_HEADER_NAME];
        const cell = row[key];
        return (
          <div
            key={`row-${i}-cell-${j}`}
            className={ cellClassNames }
          >
            {cell}
          </div>
        );
      })
      )
    }
    </Table>
  )

};

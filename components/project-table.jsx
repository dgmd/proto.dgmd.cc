"use client"

import {
  KEY_PROJECT_DATA,
  PARAM_PROJECT_ID
} from '@/api/project/keys';
import {
  ClipboardButton
} from '@/components/clipboard-button.jsx';
import {
  LinkButton
} from '@/components/link-button.jsx';
import {
  buttonClassNames,
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
  useCallback,
  useRef,
  useState
} from 'react';

const KEY_SNAPSHOT_NAME = 'snapshot date';
const KEY_SNAPSHOT_LINK = 'snapshot link';

export const ProjectTable =
  ({rosterName, userName, projectName, projectId, liveRow, snapshotRows, url}) => {

  const rLoading = useRef( false );
  
  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_NAME, 
      [TABLE_HEADER_HIDE]: null
    },
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_LINK,
      [TABLE_HEADER_HIDE]: null
    }
  ] );

  const [cells, setCells] = useState( x => {
    const data = liveRow.concat( snapshotRows );
    return data.map( mapRows );
  } );

  const cbAddSnapshot = useCallback( async () => {
    if (rLoading.current) {
      return;
    }
    rLoading.current = true;
    await fetch( '/api/project/', {
      method: 'POST',
      body: JSON.stringify( { 
        [PARAM_PROJECT_ID]: projectId
      } )
    } );

    const projectUrl = new URL('/api/project', url);
    projectUrl.searchParams.append(PARAM_PROJECT_ID, projectId);
    const projectResult = await fetch( projectUrl.href, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 }
    } );
    const projectJson = await projectResult.json();
    const snapshotRows = projectJson[KEY_PROJECT_DATA];
    setCells( x => liveRow.concat(...snapshotRows).map( mapRows ) );
    rLoading.current = false;
  }, [
    projectId,
    url,
    liveRow
  ] );

  return (
    <div className='flex-grow'>  
      <Title
        title={ projectName }
        subtitle={ `${rosterName}\u00a0/\u00a0${userName}` }
      >
        <button
          className={ `${buttonClassNames} mt-2` }
          onClick={ cbAddSnapshot }>
          Add Snapshot
        </button>
      </Title>

      <div
        className={ `flex flex-col grow sm:px-6 lg:px-8` }
      >
        <Table
          headers={headers}
        >
        {
          cells.map((row, i) => 
            headers.map((header, j) => {
              const key = header[TABLE_HEADER_NAME];
              const cell = row[key];
              const classNames = [cellClassNames, cellHoverClassNames].join(' ');
              return (
                <div key={`row-${i}-cell-${j}`}>
                  {key === KEY_SNAPSHOT_LINK && (
                  <div className={ [cellClassNames, 'space-x-1'].join( ' ' )}>
                    <LinkButton link={row[KEY_SNAPSHOT_LINK]} />
                    <ClipboardButton text={row[KEY_SNAPSHOT_LINK]} />
                  </div>
                  )}
                  {key === KEY_SNAPSHOT_NAME && (
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
  )

};


const mapRows = cur => {
  return {
    [KEY_SNAPSHOT_NAME]: cur.name,
    [KEY_SNAPSHOT_LINK]: cur.url
  };
};
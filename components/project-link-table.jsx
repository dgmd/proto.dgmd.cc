"use client"

import {
  KEY_PROJECT_DATA,
  PARAM_PROJECT_ID
} from '@/api/project/keys';
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
  Title,
  TitlePath
} from '@/components/title.jsx';
import {
  useCallback,
  useRef,
  useState
} from 'react';

const KEY_SNAPSHOT_NAME = 'snapshot date';
const KEY_SNAPSHOT_LINK = 'snapshot link';

export const ProjectLinkTable =
  ({rosterName, 
    rosterId,
    userName,
    userId,
    projectName,
    projectId,
    liveRow,
    snapshotRows,
    url,
    admin
  }) => {

  const rLoading = useRef( false );
  
  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_NAME, 
      [TABLE_HEADER_HIDE]: null
    },
    { [TABLE_HEADER_NAME]: KEY_SNAPSHOT_LINK,
      [TABLE_HEADER_HIDE]: null
    }
  ] );

  const baseURL = new URL( `/group/${rosterId}/${userId}/${projectId}/`, url );
  const [cells, setCells] = useState( x => {
    const data = liveRow.concat( snapshotRows );
    return data.map( row => mapRow( row, baseURL ) );
  } );

  const cbAddSnapshot = useCallback( async () => {
    if (rLoading.current) {
      return;
    }
    rLoading.current = true;
    await fetch( '/api/project/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 },
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
    setCells( x => liveRow.concat(...snapshotRows).map( 
      row => mapRow(row, baseURL) ) );
    rLoading.current = false;
  }, [
    projectId,
    url,
    baseURL,
    liveRow
  ] );

  return (
    <div className='flex-grow'>  
      <Title
        title={ projectName }
        subtitle={ 
          <TitlePath 
            path={[rosterName, userName]}
            links={[
              admin ? `/group/${rosterId}` : null,
              `/group/${rosterId}/${userId}`
            ]}
          /> }
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


const mapRow = (cur, baseURL) => {
  const getName = () => {
    if (cur.live) {
      return 'live';
    }
    const date = new Date(cur.date);
    const readableString = date.toLocaleString("en-US", {
      // weekday: "long", // e.g., Monday
      year: "numeric",
      month: "short", // e.g., December
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short", // e.g., GMT
    });
    return readableString;
  };
  const getLink = () => {
    const url = new URL(baseURL.toString());
    const pathprefix = cur.live ? 'live-' : 'snap-';
    url.pathname = [url.pathname, pathprefix, cur.id].join('');
    return url.toString();
  };
  return {
    [KEY_SNAPSHOT_NAME]: getName(),
    [KEY_SNAPSHOT_LINK]: getLink()
  };
};

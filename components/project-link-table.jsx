"use client"

import {
  KEY_PROJECT_DATA,
  PARAM_PROJECT_ID,
  PARAM_PROJECT_JSON
} from '@/api/project/keys';
import {
  LinkButton
} from '@/components/link-button.jsx';
import {
  buttonClassNames,
  buttonDisabledClassNames,
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
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_ID,
  DGMD_CURSOR_DATA,
  DGMD_CURSOR_HAS_MORE,
  DGMD_CURSOR_NEXT,
  DGMD_DATABASE_ID,
  DGMD_METADATA,
  DGMD_PRIMARY_DATABASE,
  DGMD_RELATION_DATABASES,
  DGMD_VALUE,
  QUERY_PARAM_DATABASE,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC
} from 'constants.dgmd.cc';
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
  const [isLoading, setIsLoading] = useState( x => rLoading.current );
  
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
    setIsLoading( x => true );

    const snaps = await fetchAllSnapshots( url, projectId );
    const isnaps = snaps.length > 1 ? combineSnaps(snaps) : snaps[0];

    //create the snapshot
    await fetch( '/api/project/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( { 
        [PARAM_PROJECT_ID]: projectId,
        [PARAM_PROJECT_JSON]: isnaps
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
    } );
    const projectJson = await projectResult.json();
    const snapshotRows = projectJson[KEY_PROJECT_DATA];
    setCells( x => liveRow.concat(...snapshotRows).map( 
      row => mapRow(row, baseURL) ) );
    rLoading.current = false;
    setIsLoading( x => false );
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
          className={ `${isLoading ? buttonDisabledClassNames : buttonClassNames} mt-2` }
          onClick={ cbAddSnapshot }
          disabled={ isLoading }
        >
          { isLoading ? `Adding Snapshot...` : `Add Snapshot` }
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

const fetchAllSnapshots = async(
  url, projectId, cursor = null, results = []) => {

  const queryUrl = new URL('/api/query', url);
  queryUrl.searchParams.append(QUERY_PARAM_DATABASE, projectId);
  if (cursor) {
    queryUrl.searchParams.append(
      QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
      QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC);
    queryUrl.searchParams.append(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST, cursor);
  }

  const queryResult = await fetch(queryUrl.href, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
  const queryJson = await queryResult.json();
  results.push(queryJson);

  const nextCursor = queryJson?.[QUERY_RESPONSE_KEY_RESULT]?.[DGMD_PRIMARY_DATABASE]?.[DGMD_CURSOR_DATA]?.[DGMD_CURSOR_NEXT] || null;
  if (nextCursor) {
    return fetchAllSnapshots(url, projectId, nextCursor, results);
  }
  else {
    return results;
  }
};


//todo: move this all to the server
const combineSnaps = snaps => {
  const snapZed = structuredClone(snaps[0]);

  const primaryBlocks = snaps.map( 
    snap => snap[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] ).flat();
  const mergedPrimaryPgs = mergeBlocks( primaryBlocks );
  snapZed[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] = mergedPrimaryPgs;

  const previewDbIds = snaps[0][QUERY_RESPONSE_KEY_RESULT][DGMD_RELATION_DATABASES].map( 
    db => db[DGMD_DATABASE_ID] );
  const mergedPreviewDbs = previewDbIds.reduce( (acc, dbId) => {
    const previewBlocks = snaps.map( snap => {
      const db = snap[QUERY_RESPONSE_KEY_RESULT][DGMD_RELATION_DATABASES].find( 
        db => db[DGMD_DATABASE_ID] === dbId );
      return db[DGMD_BLOCKS];
    } ).flat();
    const mergedPreviewPgs = mergeBlocks( previewBlocks );
    acc[dbId] = mergedPreviewPgs;
    return acc;
  }, {} );

  snapZed[QUERY_RESPONSE_KEY_RESULT][DGMD_RELATION_DATABASES].forEach( db => {
    const dbId = db[DGMD_DATABASE_ID];
    db[DGMD_BLOCKS] = mergedPreviewDbs[dbId];
  } );

  snapZed[QUERY_RESPONSE_KEY_RESULT][DGMD_PRIMARY_DATABASE][DGMD_CURSOR_DATA] = {
    [DGMD_CURSOR_NEXT]: null,
    [DGMD_CURSOR_HAS_MORE]: false
  };

  return snapZed;
};

const getBlockId = obj => obj[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE];

const mergeBlocks = lists => {
  const mergedList = Array.from(
    lists.reduce((map, obj) => {
      const id = getBlockId(obj);
      map.set(id, obj);
      return map;
    }, new Map()).values()
  );

  return mergedList;
};

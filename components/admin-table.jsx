"use client"

import {
  KEY_ROSTERS_DATA,
  KEY_ROSTER_AUTH,
  KEY_ROSTER_DELETED,
  KEY_ROSTER_ID,
  PARAM_ROSTERS_DB_ID,
  PARAM_ROSTERS_ROSTER_ID
} from '@/api/rosters/keys.js';
import {
  ClipboardButton
} from '@/components/clipboard-button.jsx';
import {
  LinkButton
} from '@/components/link-button.jsx';
import {
  buttonClassNames,
  cellClassNames,
  cellHoverClassNames,
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from '@/components/look.js';
import {
  SidePanel
} from '@/components/side-panel.jsx';
import {
  TABLE_COL_HIDE_MD,
  TABLE_COL_HIDE_SM,
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from '@/components/table.jsx';
import {
  Title
} from '@/components/title.jsx';
import {
  ArrowPathIcon,
  MinusIcon
} from '@heroicons/react/20/solid';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const KEY_NAME = 'name';
const KEY_DB_ID = 'notion id';
const KEY_URL = 'url';
const KEY_UPDATE = 'date updated';
const KEY_ACTIONS = 'actions';

export const AdminTable = ( {data, url} ) => {

  const [dbId, setDbId] = useState( '' );
  const [dbIdValid, setDbIdValid] = useState( false );

  const [open, setOpen] = useState( x => false );
  const [addRosterError, setAddRosterError] = useState( x => false );

  const [refreshing, setRefreshing] = useState( x => [] );
  const rRefreshing = useRef( refreshing );
  const [deleting, setDeleting] = useState( x => [] );
  const rDeleting = useRef( deleting );
  
  const [addingNotionRoom, setAddingNotionRoom] = useState( x => false );
  const rAddingNotionRoom = useRef( addingNotionRoom );


  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_NAME, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_DB_ID, [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_MD },
    { [TABLE_HEADER_NAME]: KEY_URL, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_UPDATE, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_ACTIONS, [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_SM },
  ] );
  const [cells, setCells] = useState( x => {
    return data.map( x => updateCellsFromData(x, url) );
  } );

  const cbCredentialsChange = useCallback( e => {
    if (rAddingNotionRoom.current) {
      return false;
    }
    const v = e.target.value;
    setDbId( s => v );
    setDbIdValid( s => v.length > 0 );
    setAddRosterError( x => false );
  }, [
  ] );
  
  const cbAddNotionRoom = useCallback( () => {
    rAddingNotionRoom.current = true;
    const post = async() => {
      const response = await fetch( '/api/rosters/', {
        method: 'POST',
        body: JSON.stringify( { 
          [PARAM_ROSTERS_DB_ID]: dbId
        } )
      } );
      const text = await response.text();
      const data = JSON.parse( text );
      if (KEY_ROSTERS_DATA in data) {
        console.log( 'cbAdd data', data );
        setCells( x => {
          return data[KEY_ROSTERS_DATA].map( x => updateCellsFromData(x, url) );
        } );
      }

      rAddingNotionRoom.current = false;
    };
    post();
  }, [
    dbId,
    url
  ] );

  const cbDeleteRosterEntry = useCallback( event => {
    const post = async() => {
      try {
        const apiDelUrl = new URL( `/api/rosters/`, url );
        const rosterId = event.target.getAttribute( 'data-roster-id' );
        apiDelUrl.searchParams.append( PARAM_ROSTERS_ROSTER_ID, rosterId );
        const response = await fetch( apiDelUrl.href, {
          method: 'DELETE'
        });
        const text = await response.text();
        const data = JSON.parse(text);
        if (!data[KEY_ROSTER_DELETED] || !data[KEY_ROSTER_AUTH]) {
          throw new Error( 'error deleting roster' );
        }
        const delRosterId = data[KEY_ROSTER_ID];
        setCells( s => s.filter( cur => cur[KEY_DB_ID] !== delRosterId ) );
      }
      catch (e) {
      }

      rAddingNotionRoom.current = false;
    };
    post();
  }, [
  ] );

  const cbRefreshRoster = useCallback( async(e) => {
  }, [
  ] );

  const mInputTw = useMemo( () => {
    const borderColor = addRosterError ? 'border-red-500' : 'border-gray-300';
    return `w-full px-3 py-2 border ${borderColor} rounded-md focus:outline-none focus:border-blue-400`;
  }, [
    addRosterError
  ] );

  return (
    <div className='flex-grow'>  

      <Title
        title={ 'Rosters List' }
      >
        <button
          className={ `${buttonClassNames} mt-2` }
          onClick={ () => setOpen( x => true ) }>
          Add Roster
        </button>
      </Title>

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
                  {key === KEY_URL && (
                    <div className={ [cellClassNames, 'space-x-1'].join( ' ' )}>
                      <LinkButton link={row[KEY_URL].pathname} />
                      <ClipboardButton text={row[KEY_URL].href} />
                    </div>
                  )}
                  {key === KEY_ACTIONS && (
                    <div className={ [cellClassNames, 'space-x-1'].join( ' ' )}>
                      <button
                        className={ getRoundButtonClasses(false) }
                        onClick={ cbRefreshRoster }
                      >
                        <ArrowPathIcon
                          className={ getRoundButtonIconClasses() }
                          alt="refresh roster"
                        />
                      </button>
                      <button
                        data-roster-id={ row[KEY_DB_ID] }
                        className={ getRoundButtonClasses(false) }
                        onClick={ cbDeleteRosterEntry }
                      >
                        <MinusIcon
                          className={ getRoundButtonIconClasses() }
                          alt="delete roster"
                        />
                      </button>
                    </div>
                  )}
                  {key !== KEY_ACTIONS && key !== KEY_URL && (
                    <div className={classNames}>
                      { key === KEY_URL ? cell.href : cell }
                    </div>
                  )}
                </div>
              );
            })
          )
        }
        </Table>
      </div>

      <SidePanel
        open={ open }
        loading={ addingNotionRoom }
        error={ addRosterError }
        setOpen={ setOpen }
        title={ 'New Roster' }
        onSaveSidePanel={ cbAddNotionRoom }
      >
        <div
          className="bg-white p-8 rounded-lg shadow-md w-96">

          <div className="mb-4">
            <label
              htmlFor="database-id"
              className="block text-gray-700 font-semibold mb-2">
                Notion Roster ID
            </label>
            <input
              type="text"
              value={ dbId }
              onChange={ cbCredentialsChange }
              id="database-id"
              placeholder="Enter Notion Roster ID"
              className={ mInputTw }
            />
          </div>

        </div>
      </SidePanel>
      
    </div>
);

};

const updateCellsFromData = (cur, url) => {
  const linkUrl = new URL( `group/${ cur.notion_id }`, url );
  return {
    [KEY_NAME]: cur.snapshot_name,
    [KEY_DB_ID]: cur.notion_id,
    [KEY_URL]: linkUrl,
    [KEY_UPDATE]: cur.created_at,
    [KEY_ACTIONS]: []
  };
};
"use client"

import {
  PARAM_ROSTERS_DB_ID
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
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

export const AdminTable = ( {data, url} ) => {

  console.log( 'data', data, 'url', url );

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

  const KEY_NAME = 'name';
  const KEY_DB_ID = 'notion id';
  const KEY_URL = 'url';
  const KEY_UPDATE = 'date updated';
  const KEY_ACTIONS = 'actions';
  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: KEY_NAME, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_DB_ID, [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_MD },
    { [TABLE_HEADER_NAME]: KEY_URL, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_UPDATE, [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: KEY_ACTIONS, [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_SM },
  ] );
  const [cells, setCells] = useState( x => {
    return data.map( cur => {
      const linkUrl = new URL( `group/${ cur.notion_id }`, url );
      return {
        [KEY_NAME]: cur.snapshot_name,
        [KEY_DB_ID]: cur.notion_id,
        [KEY_URL]: linkUrl,
        [KEY_UPDATE]: cur.created_at,
        [KEY_ACTIONS]: []
      };
    } );
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
      });
      const text = await response.text();
      const data = JSON.parse(text);

      rAddingNotionRoom.current = false;
    };
    post();
  }, [
    dbId
  ] );

  const cbDeleteRosterEntry = useCallback( () => {
    console.log( 'delete' );
  }, [
  ] );

  const cbRefreshRoster = useCallback( () => {
    console.log( 'refresh' );
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
                          alt="refresh data"
                        />
                      </button>
                      <button
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

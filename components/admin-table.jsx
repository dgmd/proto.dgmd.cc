"use client"

import {
  KEY_ROSTER_AUTH,
  PARAM_DB_ID
} from '@/api/rosters/keys.js';
import {
  ArrowPathIcon,
  MinusIcon
} from '@heroicons/react/20/solid';
import {
  ClipboardButton
} from 'components/clipboard-button.jsx';
import {
  LinkButton
} from 'components/link-button.jsx';
import {
  TABLE_COL_HIDE_MD,
  TABLE_COL_HIDE_SM,
  TABLE_HEADER_HIDE,
  TABLE_HEADER_NAME,
  Table
} from 'components/table.jsx';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  buttonClassNames,
  cellClassNames,
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from '/components/look.js';
import {
  SidePanel
} from '/components/side-panel.jsx';
import {
  Title
} from '/components/title.jsx';

export const AdminTable = ( ) => {

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
    { [TABLE_HEADER_NAME]: 'name', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'dbId', [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_MD },
    { [TABLE_HEADER_NAME]: 'url', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'update', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'actions', [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_SM },
  ] );

  useEffect( () => {
    const get = async() => {
      const response = await fetch( '/api/rosters/', {
        method: 'GET'
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (!data[KEY_ROSTER_AUTH]) {
        return;
      }
    };
    get();
  }, [
  ] );

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
          [PARAM_DB_ID]:dbId
        } )
      });
      const text = await response.text();
      const data = JSON.parse(text);
      console.log( 'data', data );

      rAddingNotionRoom.current = false;
    };
    post();
  }, [
    dbId
  ] );

  const cbDeleteNotionRoom = useCallback( async(e) => {
  }, [
  ] );

  const cbRefreshNotionRoom = useCallback( async(e) => {
  }, [
  ] );

  const [cells, setCells] = useState( x => [
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
          onClick={ () => setOpen( x => true) }>
          Add Roster
        </button>
      </Title>

      <div
        className={ `flex flex-col grow sm:px-6 lg:px-8` }
      >
        <Table
          headers={ headers }
        >
          {/* existing rows */}
          {
            cells.map( (cell, cellIdx) => {
              const key = `c${cellIdx}`;
              const colNum = cellIdx % headers.length;
              if (colNum === 4) {
                return (
                  <div
                    key={ key }
                    className={ `${cellClassNames} flex space-x-1` }
                  >
                    <button
                      data-row={ cells[ cellIdx - 3 ] }
                      type="button"
                      onClick={ cbDeleteNotionRoom }
                      className={ getRoundButtonClasses( false ) }
                    >
                    <MinusIcon
                      className={ getRoundButtonIconClasses() }
                      aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-row={ cells[ cellIdx - 3 ] }
                      onClick={ cbRefreshNotionRoom }
                      className={ 
                        `${ getRoundButtonClasses( false ) } ${ refreshing.includes( cells[ cellIdx - 3 ] ) ? `animate-spin` : `` }` }
                    >
                      <ArrowPathIcon
                        className={ getRoundButtonIconClasses() }
                        aria-hidden="true" />
                    </button>
                  </div>
                );
              }
              return (
                cellIdx % headers.length === 2 ? (
                  <div
                    key={ key}
                    className={ `${cellClassNames} flex flex-row gap-2` }
                  >
                    <ClipboardButton
                      text={ `${window.location.origin}/group/${cells[ cellIdx - 2 ]}` }
                    />
                    <LinkButton
                      link={ `/group/${cells[ cellIdx - 2 ]}` }
                    />
                  </div>
                )
                :
                <div
                  key={ key }
                  className={ `${cellClassNames}` }
                >
                  { cell }
                </div>
              )
            } )
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

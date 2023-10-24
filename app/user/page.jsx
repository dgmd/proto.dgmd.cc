"use client"

import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  useRouter
} from "next/navigation";

import {
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGNED_OUT,
  useAuthentication
} from 'hooks/AuthenticationHook.js';

import {
  ArrowPathIcon,
  MinusIcon
} from '@heroicons/react/20/solid';

import {
  getTextFromReadableStream
} from 'utils/network.js';

import {
  buttonClassNames,
  cellClassNames,
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from '/components/look.js';

import {
  URL_SEARCH_PARAM_DATABASE,
  URL_SEARCH_PARAM_BLOCKS_REQUEST,
  URL_SEARCH_PARAM_RELATIONS_REQUEST,

  NOTION_RESULT,
  NOTION_RESULT_SUCCESS
} from 'app/api/query/keys.js';

import {
  getUserId
} from 'hooks/AuthenticationHook.js';

import {
  Table,
  TABLE_COL_HIDE_MD,
  TABLE_COL_HIDE_SM,
  TABLE_HEADER_NAME,
  TABLE_HEADER_HIDE
} from 'components/table.jsx';

import {
  ClipboardButton
} from 'components/clipboard-button.jsx';

import {
  LinkButton
} from 'components/link-button.jsx';

import {
  Title
} from '/components/title.jsx';

import {
  SidePanel
} from '/components/side-panel.jsx';

import {
  addListItem,
  removeListItem
} from '/utils/lists.js';

const User = ( ) => {

  const [
    authSessionState, 
    authSession, 
    authEvent,
    supabase,
    supaUiReady
  ] = useAuthentication();

  const [name, setName] = useState( '' );
  const [nameValid, setNameValid] = useState( false );
  const rName = useRef( name );
  const [dbId, setDbId] = useState( '' );
  const [dbIdValid, setDbIdValid] = useState( false );
  const rDbId = useRef( dbId );

  const [open, setOpen] = useState( x => false );
  const [addRosterError, setAddRosterError] = useState( x => false );

  const [refreshing, setRefreshing] = useState( x => [] );
  const rRefreshing = useRef( refreshing );
  const [deleting, setDeleting] = useState( x => [] );
  const rDeleting = useRef( deleting );
  
  const cbCredentialsChange = useCallback( e => {

    if (rAddingNotionRoom.current) {
      return false;
    }

    const v = e.target.value;
    const src = e.target.getAttribute( 'data-column' );

    if (src === 'dbId') {
      rDbId.current = v;
      setDbId( s => v );
      setDbIdValid( s => v.length > 0 );
    }
    else if (src === 'name') {
      rName.current = v;
      setName( s => v );
      setNameValid( s => v.length > 0 );
    }

    setAddRosterError( x => false );
  }, [
  ] );

  const rInputs = useRef( {
    ['name']: createRef(),
    ['dbId']: createRef()
  } );

  const [headers, setHeaders] = useState( x => [ 
    { [TABLE_HEADER_NAME]: 'name', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'dbId', [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_MD },
    { [TABLE_HEADER_NAME]: 'url', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'update', [TABLE_HEADER_HIDE]: null },
    { [TABLE_HEADER_NAME]: 'actions', [TABLE_HEADER_HIDE]: TABLE_COL_HIDE_SM },
  ] );

  const [addingNotionRoom, setAddingNotionRoom] = useState( x => false );
  const rAddingNotionRoom = useRef( addingNotionRoom );
  const cbAddNotionRoom = useCallback( async() => {
    if (rAddingNotionRoom.current) {
      return;
    }
    const dbId = rDbId.current;
    const name = rName.current;
    if (dbId.length === 0 || name.length === 0) {
      setAddRosterError( x => true );
      return;
    }

    setAddingNotionRoom( x => true );
    rAddingNotionRoom.current = true;

    try {
      const js = await queryApiForRoom( dbId );
      if (js[NOTION_RESULT_SUCCESS]) {
        const result = js[NOTION_RESULT];

        const insertRoomSupa = await supabase
        .from( 'notion_rooms' )
        .insert({ 
          'auth_user_id': getUserId(authSession),
          'notion_db_id': dbId,
          'name': name,
        })
        .select('id');

        const insertDataSupa = 
        await supabase
        .from( 'notion_rooms_data' )
        .insert({
          'auth_user_id': getUserId(authSession),
          'notion_table': insertRoomSupa.data[0].id,
          'data': result
        });

        rInputs.current['name'].current.value = '';
        rInputs.current['dbId'].current.value = '';

        rAddingNotionRoom.current = false;
        setAddingNotionRoom( x => false );
        setAddRosterError( x => false );
        setOpen( x => false );

        //let's get some new data with our new roster!
        fetchData( authSession );
      }
      else {
        setAddRosterError( x => true );
        rAddingNotionRoom.current = false;
        setAddingNotionRoom( x => false );
      }
    }
    catch (err) {
      setAddRosterError( x => true );
      rAddingNotionRoom.current = false;
      setAddingNotionRoom( x => false );
    }

  }, [
    authSession
  ] );

  const cbDeleteNotionRoom = useCallback( async(e) => {
    const dbId = e.target.getAttribute( 'data-row' );
    if (rRefreshing.current.includes( dbId ) || rDeleting.current.includes( dbId )) {
      return;
    }

    setDeleting( x => addListItem( x, dbId ) );
    rDeleting.current = addListItem( rDeleting.current, dbId );

    try {
      const findRoomIdSupa = await supabase
      .from( 'notion_rooms' )
      .select( 'id' )
      .eq( 'notion_db_id', dbId )
      .eq( 'auth_user_id', getUserId(authSession) );

      const deleteRoomDataSupa = await supabase
      .from( 'notion_rooms_data' )
      .delete( )
      .eq( 'notion_table', findRoomIdSupa.data[0].id )
      .eq( 'auth_user_id', getUserId(authSession) );

      const deleteRoomSupa = await supabase
      .from( 'notion_rooms' )
      .delete( )
      .eq( 'notion_db_id', dbId )
      .eq( 'auth_user_id', getUserId(authSession) );
    }
    catch (e) {
      // console.log( 'error deleting', e );
    }
    try {
      fetchData( authSession );
    }
    catch (e) {
    }

    setDeleting( x => removeListItem(x, dbId) );
    removeListItem( rDeleting.current, dbId );
  }, [
    authSession
  ] );

  const cbRefreshNotionRoom = useCallback( async(e) => {
    const dbId = e.target.getAttribute( 'data-row' );
    if (rRefreshing.current.includes( dbId ) || rDeleting.current.includes( dbId )) {
      return;
    }

    setRefreshing( x => addListItem( x, dbId ) );
    rRefreshing.current = addListItem( rRefreshing.current, dbId );

    const js = await queryApiForRoom( dbId );
    if (js && js[NOTION_RESULT_SUCCESS]) {
      const result = js[NOTION_RESULT];
      
      const insertRoomSupa = await supabase
      .from( 'notion_rooms' )
      .select('id')
      .eq( 'notion_db_id', dbId );

      const id = insertRoomSupa.data[0].id;

      const insertDataSupa = 
      await supabase
      .from( 'notion_rooms_data' )
      .insert({
        'auth_user_id': getUserId(authSession),
        'notion_table': id,
        'data': result
      });

      console.log( 'insertDataSupa', insertDataSupa );
    }

    try {
      fetchData( authSession );
    }
    catch (e) {
    }
    setRefreshing( x => removeListItem(x, dbId) );
    rRefreshing.current = removeListItem(rRefreshing.current, dbId);
  }, [
    authSession
  ] );

  const [cells, setCells] = useState( x => [
  ] );

  const mInputTw = useMemo( () => {
    const borderColor = addRosterError ? 'border-red-500' : 'border-gray-300';
    return `w-full px-3 py-2 border ${borderColor} rounded-md focus:outline-none focus:border-blue-400`;
  }, [
    addRosterError
  ] );

  const router = useRouter( );
  useEffect( () => {
    if (authSessionState === AUTH_STATE_SIGNED_OUT) {
      router.push("/user/signin/");
    }
    else if ( authSessionState === AUTH_STATE_SIGNED_IN && supabase ) {
      fetchData( authSession );
    }
  }, [
    authSessionState,
    authSession,
    supabase
  ] );

  const fetchData = async ( authSession ) => {
    try {

      const cells = [];

      const roomResult = await supabase
      .from( 'notion_rooms' )
      .select( 'id, notion_db_id, name, url_id' )
      .eq( 'auth_user_id', getUserId(authSession) );

      const roomResultData = roomResult.data;
      for (const roomResultDatum of roomResultData) {
        const roomDataResult = await supabase
        .from( 'notion_rooms_data' )
        .select( 'created_at' )
        .order( 'created_at', { ascending: false } )
        .eq( 'notion_table', roomResultDatum.id )
        .limit( 1 );

        cells.push( roomResultDatum.name );
        cells.push( roomResultDatum.notion_db_id );
        cells.push( roomResultDatum.url_id );
        cells.push( roomDataResult.data[0].created_at );
        cells.push( null );
      }

      setCells( x => cells );
    }
    catch (err) {
      // console.error( err );
    }
  }

  if (!supaUiReady || authSessionState !== AUTH_STATE_SIGNED_IN) {
    return null;
  }

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
              htmlFor="roster-name"
              className="block text-gray-700 font-semibold mb-2">
                Group Name
              </label>
            <input
              type="text"
              value={ name }
              onChange={ cbCredentialsChange }
              data-column="name"
              id="roster-name"
              placeholder="Enter Group Name"
              className={ mInputTw }
              ref={ rInputs.current['name'] }
            />
          </div>

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
              data-column="dbId"
              id="database-id"
              placeholder="Enter Notion Roster ID"
              className={ mInputTw }
              ref={ rInputs.current['dbId'] }
            />
          </div>

        </div>
      </SidePanel>
    </div>
);

};

export default User;

const queryApiForRoom = async( dbId ) => {
  const paramsObj = {
    [URL_SEARCH_PARAM_DATABASE]: dbId,
    [URL_SEARCH_PARAM_BLOCKS_REQUEST]: true,
    [URL_SEARCH_PARAM_RELATIONS_REQUEST]: false
  };
  const params = new URLSearchParams( paramsObj );
  const res = await fetch(
    `/api/query?${ params.toString() }`
  );
  const resBody = res.body;
  const text = await getTextFromReadableStream( resBody );
  const js = JSON.parse( text );
  return js;
};
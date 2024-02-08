import {
  Children,
  useMemo
} from "react";

export const TABLE_COL_HIDE_SM = 'TABLE_COL_HIDE_SM';
export const TABLE_COL_HIDE_MD = 'TABLE_COL_HIDE_MD';
export const TABLE_HEADER_HIDE = 'TABLE_HEADER_HIDE';
export const TABLE_HEADER_NAME = 'TABLE_HEADER_NAME';

const KEY_COL_SPAN = 'KEY_COL_SPAN';
const KEY_COL_CHILDREN = 'KEY_COL_CHILDREN';

export const Table = props => {

  const pHeaders = props.headers;
  const pChildren = props.children;

  const mRows = useMemo( () => {
    const kids = Children.toArray( pChildren );
    const rows = [];
    for (var k=0; k<kids.length; k++) {
      const kid = kids[k];
      if (kid.props.spancol) {
        rows.push( {
          [KEY_COL_SPAN]: true,
          [KEY_COL_CHILDREN]: kid
        } );
      }
      else {
        rows.push( {
          [KEY_COL_SPAN]: false,
          [KEY_COL_CHILDREN]: kids.slice( k, k + pHeaders.length )
        } );
        k += pHeaders.length - 1;
      }
    }

    return rows;
  }, [
    pChildren
  ] );

  return (
    <div className="w-full mx-auto max-w-7xl relative overflow-hidden">
    <div className="px-4 sm:px-6 lg:px-8">
    <div className="mt-8 flow-root">
    <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
    <div className="inline-block min-w-full py-2 align-middle">
    <table className="w-full border-collapse border-spacing-0 table-fixed">
      <thead>
        <tr>
          { pHeaders.map( (header, headerIdx) => {

            const hideStr = getColWidthTailwind( header );
            const headerName = header[TABLE_HEADER_NAME];
            
            return (
              <th
                key={ headerIdx }
                scope="col"
                className={ 
                  `truncate sticky ${ hideStr } h-16 top-0 bg-gray-200 border-2 border-solid border-transparent text-left text-sm font-semibold text-gray-900`}
              >
                { headerName }
              </th>
            );
            } )
          }

        </tr>
      </thead>
      <tbody>
      {
        mRows.map( ( row, rowIdx ) => {
          return (
            <tr
              key={ rowIdx }
            >
              {
                getRowElements( row, rowIdx, pHeaders )
              }
            </tr>
          );
        } )
      }
      </tbody>
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

const getColWidthTailwind = header => {

  const headerHide = header[TABLE_HEADER_HIDE];
  
  const hideList = [];
  if ( headerHide !== null ) {

    hideList.push( 'overflow-hidden' );
    hideList.push( 'w-0' );
    hideList.push( 'pl-0' );
    hideList.push( 'pr-0' );
    hideList.push( 'ml-0' );
    hideList.push( 'mr-0' );

    if (headerHide === TABLE_COL_HIDE_SM) {
      hideList.push( 'sm:table-cell' );
      hideList.push( 'sm:overflow-visible' );
      hideList.push( 'sm:w-auto' );

      // hideList.push( 'sm:border-red-700 sm:border-solid sm:border-2' );
      hideList.push( 'sm:pl-6' );
      hideList.push( 'sm:pr-6' );
    }
    else if (headerHide === TABLE_COL_HIDE_MD) {
      hideList.push( 'lg:table-cell' );
      hideList.push( 'lg:overflow-visible' );
      hideList.push( 'lg:w-auto' );

      // hideList.push( 'lg:border-green-700 lg:border-solid lg:border-4' );
      hideList.push( 'lg:pl-6' );
      hideList.push( 'lg:pr-6' );
    }
  }
  else {
    hideList.push( 'pl-6' );
    hideList.push( 'pr-6' );
  }

  const hideStr = hideList.join( ' ' );
  return hideStr;
};

const getRowElements = ( row, rowIdx, pHeaders ) => {

  const cells = row[KEY_COL_CHILDREN];

  if ( row[KEY_COL_SPAN] ) {
    return (
      <td
        colSpan={ pHeaders.length }
        className={ 'p-0' }
      >
        { cells }
      </td>
    );
  }
  return cells.map( ( cell, cellIdx ) => {
    const header = pHeaders[cellIdx];
    const hideStr = getColWidthTailwind( header );
    return (
      <td
        key={ cellIdx }
        className={
          //https://github.com/tailwindlabs/tailwindcss/pull/560#issuecomment-503222143
          `${ hideStr } border-b border-r border-gray-200 whitespace-nowrap py-4 text-sm font-medium`
        }
      >
        { cell }
      </td>
    );
  } );

};
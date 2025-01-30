const buttonClassBase = 'inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 w-fit';
export const buttonClassNames = buttonClassBase + ' bg-primary-600 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';
export const buttonCancelClassNames = buttonClassBase + ' bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400';
export const buttonDisabledClassNames = buttonClassBase + ' bg-gray-400 text-sm font-semibold text-white shadow-sm cursor-not-allowed opacity-50';

export const cellClassNames = 'select-all box-content border border-transparent inline-block relative w-full whitespace-nowrap overflow-hidden overflow-ellipsis align-top';
export const cellHoverClassNames = 'hover:z-10 hover:w-auto hover:bg-primary-200 hover:border-primary-500 hover:padding-10 hover:shadow-md';

export const linkClassNames = 'text-secondary-500 underline hover:text-secondary-700 hover:underline';

export const getRoundButtonClasses = ( disabledTw ) => {
  const txt = `rounded-full bg-primary-600 p-1 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
  return `${txt} ${ disabledTw ? ' opacity-50 cursor-not-allowed' : '' }`;
};

export const getRoundButtonIconClasses = () => {
  return `h-5 w-auto pointer-events-none`;
};
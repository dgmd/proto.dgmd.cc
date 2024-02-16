const buttonClassBase = 'inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 w-fit';
export const buttonClassNames = buttonClassBase + ' bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
export const buttonCancelClassNames = buttonClassBase + ' bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400';

export const cellClassNames = 'box-content border border-transparent inline-block relative w-full whitespace-nowrap overflow-hidden overflow-ellipsis align-top';
export const cellHoverClassNames = 'transition duration-300 ease-in-out hover:z-10 hover:w-auto hover:bg-indigo-200 hover:border-indigo-500 hover:padding-10 hover:shadow-md';

export const getRoundButtonClasses = ( disabledTw ) => {
  const txt = `rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`;
  return `${txt} ${ disabledTw ? ' opacity-50 cursor-not-allowed' : '' }`;
};

export const getRoundButtonIconClasses = () => {
  return `h-5 w-auto pointer-events-none`;
};


export const TableRow = ({name}) => {
  return (
    <div
      className={
        `top-0 border-b border-gray-300 bg-gray-100 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8`
      }
    >
      { name }
    </div>
  );
};
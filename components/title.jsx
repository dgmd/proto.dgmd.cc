export const Title = props => {
  const pTitle = props.title;
  const pSubtitle = props.subtitle;
  const pChildren = props.children;
  return (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="tracking-tight font-bold text-gray-900">
        <h2 className="text-3xl">
        { `\u00a0${decodeURI(pTitle)}` }
        </h2>
        <h3 className="text-1xl text-gray-500">
        { `\u00a0${ pSubtitle ? decodeURI(pSubtitle) : '' }` }
        </h3>
        { pChildren }
      </div>
     </div>
</div>
  );
};
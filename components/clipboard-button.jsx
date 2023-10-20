import {
  ClipboardIcon
} from '@heroicons/react/20/solid';

export const ClipboardButton = props => {
  const text = props.text;
  return (
    <button
      type="button"
      className="rounded-md bg-indigo-50 px-1.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
      onClick={ () => navigator.clipboard.writeText(text) }
    >
      <ClipboardIcon
        className="h-4 w-auto text-indigo-400"
        alt="copy to clipboard"
      />
    </button>
  );
};


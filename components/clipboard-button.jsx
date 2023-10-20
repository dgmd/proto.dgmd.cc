import {
  ClipboardIcon
} from '@heroicons/react/24/outline';

import {
  urlButtonClassNames,
  urlButtonTextClassNames
} from './look.js';

export const ClipboardButton = props => {
  const text = props.text;
  return (
    <button
      type="button"
      className={ urlButtonClassNames }
      onClick={ () => navigator.clipboard.writeText(text) }
    >
      <ClipboardIcon
        className={ urlButtonTextClassNames }
        alt="copy to clipboard"
      />
    </button>
  );
};


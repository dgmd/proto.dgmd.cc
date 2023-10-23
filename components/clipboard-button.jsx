import {
  ClipboardIcon
} from '@heroicons/react/24/outline';

import {
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from './look.js';

export const ClipboardButton = props => {
  const text = props.text;
  return (
    <button
      type="button"
      className={ getRoundButtonClasses(false) }
      onClick={ () => navigator.clipboard.writeText(text) }
    >
      <ClipboardIcon
        className={ getRoundButtonIconClasses() }
        alt="copy to clipboard"
      />
    </button>
  );
};


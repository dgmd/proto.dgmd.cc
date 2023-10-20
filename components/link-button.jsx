import {
  ArrowUpOnSquareIcon
} from '@heroicons/react/24/outline';

import Link from 'next/link';

import {
  urlButtonClassNames,
  urlButtonTextClassNames
} from './look';

export const LinkButton = props => {
  const link = props.link;
  return (
    <Link
      href={ link }
    >
      <button
        type="button"
        className={ urlButtonClassNames }
      >
        <ArrowUpOnSquareIcon
          className={ urlButtonTextClassNames }
        />
      </button>
    </Link>
  );
};
  
  
import {
  ArrowRightIcon
} from '@heroicons/react/24/outline';

import Link from 'next/link';

import {
  getRoundButtonClasses,
  getRoundButtonIconClasses
} from './look';

export const LinkButton = props => {
  const link = props.link;
  return (
    <Link
      href={ link }
    >
      <button
        type="button"
        className={ getRoundButtonClasses(false) }
      >
        <ArrowRightIcon
          className={ getRoundButtonIconClasses() }
        />
      </button>
    </Link>
  );
};
  
  
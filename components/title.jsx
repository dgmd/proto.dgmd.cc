"use client"

import {
  linkClassNames
} from '@/components/look.js';
import {
  Fragment
} from 'react';

export const Title = ({
  title,
  subtitle,
  children
}) => {
  return (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="tracking-tight font-bold text-gray-900">
        {
        title &&
        <h2 className="text-3xl">
        { title }
        </h2>
        }
        {
        subtitle &&
        <h3 className="text-1xl text-gray-500">
        { subtitle }
        </h3>
        }
        { children }
      </div>
    </div>
  </div>
  );
};

export const TitlePath = ({ path=[], links=[], separator=' / ' }) => {
  const items = path.map((text, index) => {
    const link = links[index];
    if (link) {
      return (
        <a key={index} href={link} className={linkClassNames}>
          {text}
        </a>
      );
    }
    return <span key={index}>{text}</span>;
  });

  return (
    <Fragment>
      {items.reduce((prev, curr) => [prev, separator, curr])}
    </Fragment>
  );
};
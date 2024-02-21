"use client"

import {
  Title
} from '@/components/title.jsx';

export const RosterEntryProjectsTable = ({data, name, groupName, dbId, url}) => {

  console.log( 'data', data );

  return (
    <div className='flex-grow'>  

      <Title
        title={ name }
        subtitle={ groupName }
      />
      <div
        className={ `flex flex-col grow sm:px-6 lg:px-8` }
      >
      </div>
    </div>
  );

};

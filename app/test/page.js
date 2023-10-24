"use client"
import { useEffect } from 'react';

import {
    createClient
  } from '@supabase/supabase-js';
    
const supabase = createClient(
process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_URL, 
process.env.NEXT_PUBLIC_REACT_APP_SUPABASE_KEY
);

export default function Page() {

    useEffect( () => {
        const fetchData = async () => {
            const roomSupa = await supabase
                .from( 'notion_rooms' )
                .select( 'id' );
                // .eq( 'name', pGroupName );
            console.log( 'roomSupa', roomSupa);
        };

        fetchData();

    },
    [ ]
    ); 

    return <div>please work</div>
};
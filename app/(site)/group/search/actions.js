"use server"

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  isNil
} from 'lodash-es';
import {
  cookies
} from 'next/headers';
import {
  redirect
} from 'next/navigation';

import {
  KEY_STUDENT_CODE
} from './keys.js';

export async function studentCodeAction( formData ) {
  let redirectUrl = '/';
  try {
    const studentCode = formData.get( KEY_STUDENT_CODE );
    if (isNil(studentCode)) {
      throw new Error('Student code is required');
    }
    const studentCodeTrim = studentCode.trim();
    const lastHyphenIndex = studentCodeTrim.lastIndexOf('-');
    if (lastHyphenIndex === -1) {
      throw new Error('Invalid student code');
    }
    const notionGroupTitle = studentCodeTrim.substring(0, lastHyphenIndex);
    const notionUserId = studentCodeTrim.substring(lastHyphenIndex + 1);

    const cookieStore = await cookies();
    const supabase = await createClient( cookieStore );
    const rosterResult = await supabase
      .from( 'rosters' )
      .select( 'notion_id' )
      .eq( 'active', true )
      .eq( 'snapshot_name', notionGroupTitle );
    if (!isNil(rosterResult.error)) {
      throw new Error('Error getting roster');
    }
    const rosters = rosterResult.data;
    if (rosters.length === 0) {
      throw new Error('Invalid snapshot name');
    }
    const roster = rosters[0];
    const notionGroupId = roster.notion_id;
    redirectUrl = `${ notionGroupId }/${ notionUserId }`;
  }
  catch (error) {
    console.log( 'error', error );
  }
  redirect( redirectUrl );
};

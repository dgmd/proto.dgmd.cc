"use server"

import {
  isNil
} from 'lodash-es';
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
    const notionGroupId = studentCodeTrim.substring(0, lastHyphenIndex).trim();
    const notionUserId = studentCodeTrim.substring(lastHyphenIndex + 1).trim();

    redirectUrl = `/group/${ notionGroupId }/${ notionUserId }`;
  }
  catch (error) {
    console.log( 'error', error );
  }
  redirect( redirectUrl );
};

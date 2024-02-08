"use server"

import {
  KEY_STUDENT_CODE
} from './keys.js';

export async function studentCodeAction( formData ) {
  const studentCode = formData.get( KEY_STUDENT_CODE );
};
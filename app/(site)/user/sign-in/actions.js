'use server'

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  revalidatePath
} from 'next/cache';
import {
  cookies
} from 'next/headers';
import {
  redirect
} from 'next/navigation';

import {
  KEY_SIGN_IN_EMAIL,
  KEY_SIGN_IN_PASSWORD
} from './keys.js';

export async function signInAction( formData ) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get(KEY_SIGN_IN_EMAIL),
    password: formData.get(KEY_SIGN_IN_PASSWORD),
  };

  const ok = await supabase.auth.signInWithPassword(data);

  if (ok.error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/user');
};

// export async function signUpAction( formData ) {
//   const cookieStore = cookies();
//   const supabase = createClient(cookieStore);

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get('email'),
//     password: formData.get('password'),
//   }

//   const { error } = await supabase.auth.signUp(data);

//   if (error) {
//     redirect('/error');
//   }

//   revalidatePath('/', 'layout');
//   redirect('/');
// };
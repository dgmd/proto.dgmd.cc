'use server'

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
  createClient
} from '../../../utils/supabase/server.js';

export async function login(formData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const ok = await supabase.auth.signInWithPassword(data);
  const error = ok.error;

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
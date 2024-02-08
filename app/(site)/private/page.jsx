"use server"

import {
  createClient
} from '@/utils/supabase/server.js';
import {
  cookies
} from 'next/headers';
import {
  redirect
} from 'next/navigation';

export default async function PrivatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();
  console.log(data, error);
  if (error || !data?.user) {
    redirect('/');
  }
  return <p>Hello {data.user.email}</p>
};
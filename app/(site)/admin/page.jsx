"use server"

import {
  AdminTable
} from '@/components/admin-table.jsx';
import {
  getAuthServerCache
} from '@/utils/auth/authServerCache.js';
import {
  isAuthUser
} from '@/utils/auth/authUtils.js';
import {
  redirect
} from 'next/navigation';

async function AdminPage( ) {

  const auth = await getAuthServerCache();
  if (!isAuthUser(auth)) {
    redirect('/admin/sign-in');
    return null;
  }

  return (
    <AdminTable/>
  );
}

export default AdminPage;
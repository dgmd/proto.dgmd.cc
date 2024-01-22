"use client"

import 'app/globals.css';

import {
  Header
} from "components/header.jsx";
import {
  usePathname
} from 'next/navigation';

export default function Layout({ 
  children,
  params
 }) {

  const pathname = usePathname();

  return (
    <div
      className="min-h-screen flex flex-col"
    >
      <Header
        showUser={ !pathname.endsWith('signin') } 
        showAdmin={ !pathname.endsWith('user') }
      />

        <div 
          className="flex-grow w-100 h-100 flex items-stretch justify-center items-center">
          { children }
        </div>
    </div>
  );
};
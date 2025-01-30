"use server"

import {
  Header
} from "@/components/header.jsx";

export default async function Layout({children}) {

  return (
    <div
      className={ `min-h-screen flex flex-col` }
    >
      <Header/>
      <div 
        className="flex-grow w-full h-100 flex items-stretch justify-center items-center">
        { children }
      </div>
    </div>
  );
};

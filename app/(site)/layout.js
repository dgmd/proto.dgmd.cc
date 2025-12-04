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
        className="grow w-full h-full flex items-center justify-center">
        { children }
      </div>
    </div>
  );
};

"use client"

import {
  Header
} from "@/components/header.jsx";

export default function Layout({ children }) {
  return (
    <div
      className={ `min-h-screen flex flex-col` }
    >
      <Header
        showUser={ true }
        showAdmin={ true }
      />
        <div 
          className="flex-grow w-100 h-100 flex items-stretch justify-center items-center">
          { children }
        </div>
    </div>
  );
};
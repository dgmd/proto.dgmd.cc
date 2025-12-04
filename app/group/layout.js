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
          className="flex-grow w-full h-full flex items-center justify-center">
          { children }
        </div>
    </div>
  );
};
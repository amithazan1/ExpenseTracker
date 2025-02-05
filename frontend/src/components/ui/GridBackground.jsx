import React from "react";

export default function GridBackground({ children }) {
  return (
    <div className="w-full text-white bg-black bg-grid-white relative">
      {children}
    </div>
  );
}

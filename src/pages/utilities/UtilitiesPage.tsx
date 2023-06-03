import React from 'react';
import { Outlet } from 'react-router';

function UtilitiesPage() {
  return (
    <div className="flex flex-col h-full">
      <Outlet />
    </div>
  );
}

export default UtilitiesPage;

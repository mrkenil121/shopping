'use client';

import React from 'react';

const CustomerLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
     
      <main className="flex-grow bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

    </div>
  );
};

export default CustomerLayout;

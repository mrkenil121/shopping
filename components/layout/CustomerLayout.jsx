'use client';

import React from 'react';
import Navbar from './Navbar'; // Ensure Navbar component exists and works
import Footer from './Footer'; // Create a Footer component or replace it as necessary

const CustomerLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header>
        <Navbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          {children} {/* This renders the page-specific content */}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <Footer />
      </footer>
    </div>
  );
};

export default CustomerLayout;

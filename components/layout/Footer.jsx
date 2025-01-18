'use client';

import React from 'react';

const Footer = () => (
  <footer className="left-0 w-full bg-gray-800 text-white py-4">
    <div className="container mx-auto text-center text-sm">
      <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
      <div className="space-x-4">
        <a href="/privacy-policy" className="text-gray-300 hover:text-white">
          Privacy Policy
        </a>
        <a href="/terms-of-service" className="text-gray-300 hover:text-white">
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;

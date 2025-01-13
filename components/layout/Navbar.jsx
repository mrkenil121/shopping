'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider'; // Import the AuthProvider hook

const Navbar = () => {
  const { user, logout } = useAuth(); // Access user and logout functionality
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client side rendering once component is mounted
    setIsClient(true);
  }, []);

  // Ensure we only render once on the client
  if (!isClient) return null;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold">
          <Link href="/">MyApp</Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link href="/about" className="hover:text-gray-400">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-400">
            Contact
          </Link>

          {/* Authentication Links */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name || 'User'}!</span>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hover:text-gray-400">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

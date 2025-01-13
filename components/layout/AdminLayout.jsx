'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router'; // Correct import for Next.js 13 and later
import { useAuth } from '../auth/AuthProvider';
import Link from 'next/link';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isClient, setIsClient] = useState(false); // To track whether the component is mounted client-side
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set client flag to true on mount
  }, []);

  if (!isClient) return null; // Prevent server-side rendering issues

  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('auth_token');
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>
        <nav className="mt-8">
          <ul>
            <li>
              <Link href="/admin/dashboard" className="block py-2 px-4 hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block py-2 px-4 hover:bg-gray-700">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block py-2 px-4 hover:bg-gray-700">
                Products
              </Link>
            </li>
            <li>
              <Link href="/admin/customers" className="block py-2 px-4 hover:bg-gray-700">
                Customers
              </Link>
            </li>
            <li>
              <Link href="/admin/reports" className="block py-2 px-4 hover:bg-gray-700">
                Reports
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                Log Out
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Admin Header */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Welcome, {user?.name}!</h2>
        </header>

        {/* Content */}
        <div className="bg-white p-6 rounded shadow-md">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;

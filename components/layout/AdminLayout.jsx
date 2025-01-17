import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut,
  ChevronDown
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  
  const isActive = (path) => router.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <span>Admin</span>
                </button>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
                ${isActive('/admin/dashboard') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link 
              href="/admin/orders" 
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
                ${isActive('/admin/orders') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <ShoppingCart size={18} />
              <span>Orders</span>
            </Link>

            <Link 
              href="/admin/products" 
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
                ${isActive('/admin/products') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Package size={18} />
              <span>Products</span>
            </Link>

            <Link 
              href="/admin/users" 
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
                ${isActive('/admin/users') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Users size={18} />
              <span>Users</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
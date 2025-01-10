import React from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation
import { useAuth } from "../components/auth/AuthProvider"; // Assuming you have an AuthProvider for managing user state

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth(); // Access the user data from AuthProvider

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
              <Link
                to="/admin/dashboard"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/customers"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reports"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Reports
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
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

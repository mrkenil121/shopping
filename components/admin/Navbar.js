import React from "react";
import {
    LogOut,
    UserCircle,
  } from "lucide-react";
import { useRouter } from "next/router";

const Navbar = () => {

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleLoginAsCustomer = () => {
    router.push("/products");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800 -ml-2">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={handleLoginAsCustomer}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <UserCircle size={18} />
              <span>Login as Customer</span>
            </button>
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
  );
};

export default Navbar;

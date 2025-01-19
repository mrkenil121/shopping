import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
} from "lucide-react";

const Sidebar = () => {

  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  return (
    <aside className="w-fit bg-white shadow-sm min-h-screen pr-9">
      <nav className="mt-5 px-2">
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
          ${
            isActive("/admin/dashboard")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
          ${
            isActive("/admin/orders")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ShoppingCart size={18} />
          <span>Orders</span>
        </Link>

        <Link
          href="/admin/products"
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
          ${
            isActive("/admin/products")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Package size={18} />
          <span>Products</span>
        </Link>

        <Link
          href="/admin/users"
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1
          ${
            isActive("/admin/users")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Users size={18} />
          <span>Users</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

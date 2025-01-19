import React from "react";
import { useRouter } from "next/router";
import Navbar from "../admin/Navbar";
import Sidebar from "../admin/Sidebar";

const AdminLayout = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
     <Navbar/>

      <div className="flex">
        <Sidebar/>

        {/* Main Content */}
        <main className="flex-1 py-6 px-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

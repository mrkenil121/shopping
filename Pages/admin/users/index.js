import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Trash2,
  Users,
  User,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LayoutDashboard,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";
import "@/app/globals.css";

const AdminUsersPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    users: [],
    pagination: { total: 0, pages: 1, current: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `/api/admin/users?page=${page}&limit=10${
          searchTerm ? `&search=${searchTerm}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users");
      if (err.response?.status === 401) {
        router.push("/login");
      }
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("user");

      await axios.put(
        `/api/admin/users?id=${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the current page
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("user");
      await axios.delete(`/api/admin/users?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the current page
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleLoginAsCustomer = () => {
    router.push("/products");
  };

  const getUserTypeCount = (role) => {
    return userData.users.filter(
      (u) => u.role.toLowerCase() === role.toLowerCase()
    ).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Users Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  Total Users: {userData.pagination.total}
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <User className="text-blue-500" size={20} />
                    <span>Regular Users: {getUserTypeCount("customer")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="text-green-500" size={20} />
                    <span>Admins: {getUserTypeCount("admin")}</span>
                  </div>
                </div>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full p-2 border rounded"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    fetchUsers(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role.toLowerCase()}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete user {user.name}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-700">
                  Page {userData.pagination.current} of{" "}
                  {userData.pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, userData.pagination.pages)
                      )
                    }
                    disabled={currentPage === userData.pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;

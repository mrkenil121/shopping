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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Trash2,
  CheckCircle,
  Clock,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import "@/app/globals.css";

const AdminOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  const isActive = (path) => router.pathname === path;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery, searchFilter);
  }, [searchQuery, searchFilter, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);
      setOrders(response.data);
      setFilteredOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch orders");
      if (err.response?.status === 401) {
        router.push("/login");
      }
      setLoading(false);
    }
  };

  const handleSearch = (query, filter) => {
    const searchTerm = query.toLowerCase();
    const filtered = orders.filter((order) => {
      switch (filter) {
        case "orderId":
          return order.id.toString().includes(searchTerm);
        case "userName":
          return order.user.name.toLowerCase().includes(searchTerm);
        case "productName":
          return order.orderItems.some((item) =>
            item.product.name.toLowerCase().includes(searchTerm)
          );
        case "wsCode":
          return order.orderItems.some((item) =>
            item.product.wsCode.toString().includes(searchTerm)
          );
        case "salesPrice":
          return order.orderItems.some((item) =>
            item.product.salesPrice.toString().includes(searchTerm)
          );
        default:
          return (
            order.id.toString().includes(searchTerm) ||
            order.user.name.toLowerCase().includes(searchTerm) ||
            order.orderItems.some(
              (item) =>
                item.product.name.toLowerCase().includes(searchTerm) ||
                item.product.wsCode.toString().includes(searchTerm) ||
                item.product.salesPrice.toString().includes(searchTerm)
            )
          );
      }
    });
    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("user");
      const response = await axios.put(
        `/api/admin/orders?id=${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      setError(error.response?.data?.error || "Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("user");
      await axios.delete(`/api/admin/orders?id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
      setFilteredOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Failed to delete order:", error);
      setError(error.response?.data?.error || "Failed to delete order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
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

  const getStatusCount = (status) => {
    return filteredOrders.filter((o) => o.status.toLowerCase() === status)
      .length;
  };

  const handleLoginAsCustomer = () => {
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">
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
        <div className="flex-1 p-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Total Orders: {filteredOrders.length}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="text-yellow-500" size={20} />
                      <span>Pending: {getStatusCount("pending")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={20} />
                      <span>Accepted: {getStatusCount("accepted")}</span>
                    </div>
                  </div>
                </div>

                {/* Search Section */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={searchFilter} onValueChange={setSearchFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Search by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="orderId">Order ID</SelectItem>
                      <SelectItem value="userName">Customer Name</SelectItem>
                      <SelectItem value="productName">Product Name</SelectItem>
                      <SelectItem value="wsCode">WS Code</SelectItem>
                      <SelectItem value="salesPrice">Sales Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              {/* First the table header */}
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>
                    <div className="grid grid-cols-4 gap-4">
                      <div>Product</div>
                      <div className="text-gray-500 text-sm">WS Code</div>
                      <div className="text-gray-500 text-sm">Price</div>
                      <div className="text-gray-500 text-sm">Quantity</div>
                    </div>
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* Then the table body */}
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Package size={16} />
                              <span className="font-medium">
                                {item.product.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.wsCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{item.product.salesPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status.toLowerCase()}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
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
                            <AlertDialogTitle>Delete Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete order #{order.id}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteOrder(order.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;

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
  CheckCircle,
  Clock,
  LogOut,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import "@/app/globals.css";

const AdminOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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
      
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch orders");
      if (err.response?.status === 401) {
        router.push("/login");
      }
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("user");
      
      // Validate status before making API call
      const validStatuses = ['pending', 'accepted'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        throw new Error('Invalid status');
      }
  
      const response = await axios.put(
        `/api/admin/orders`,
        { 
          status: newStatus.toLowerCase() 
        },
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update local state only if API call was successful
      if (response.data) {
        setOrders(prevOrders =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, ...response.data } : order
          )
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      // You might want to show an error message to the user
      setError(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleLoginAsCustomer = () => {
    router.push("/products");
  }

  const handleDeleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("user");
      await axios.delete(`/api/admin/orders?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from local state
      setOrders(orders.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Failed to delete order:", error);
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
    return orders.filter((o) => o.status.toLowerCase() === status).length;
  };

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
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Products</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-1 text-gray-700 hover:bg-gray-50"
            >
              <Package size={18} />
              <span>Users</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  Total Orders: {orders.length}
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
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span>{order.orderItems.length}</span>
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

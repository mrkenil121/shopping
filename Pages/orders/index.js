import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

// Utility function to fetch orders from the API
const fetchOrders = async (token) => {
  try {
    const res = await fetch('/api/orders', {  // Changed from /api/orders/${id}
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch orders");
    }
    
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Function to decode and validate JWT token
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem("user");
    if (!token) return { user: null, token: null };
    
    const decoded = jwtDecode(token);
    
    // Validate token expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("user");
      return { user: null, token: null };
    }
    
    // Validate required fields
    if (!decoded.id || !decoded.role) {
      localStorage.removeItem("user");
      return { user: null, token: null };
    }
    
    return { user: decoded, token };
  } catch (error) {
    localStorage.removeItem("user");
    console.error("Error decoding JWT:", error);
    return { user: null, token: null };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Memoize fetchData to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    const { user, token } = getUserFromToken();

    if (!user || !token) {
      router.push("/login");
      return;
    }

    try {
      const fetchedOrders = await fetchOrders(token);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err.message || "Unable to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      confirmed: "text-green-500",
      pending: "text-yellow-500",
      shipped: "text-blue-500",
      delivered: "text-green-600",
      cancelled: "text-red-500"
    };
    return statusColors[status] || "text-gray-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-md">
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Your Orders</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Order ID</th>
                <th className="px-4 py-2 border-b text-left">Date</th>
                <th className="px-4 py-2 border-b text-left">Total Amount</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{order.id}</td>
                  <td className="px-4 py-2 border-b">
                    {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                  </td>
                  <td className="px-4 py-2 border-b">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span className={getStatusColor(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
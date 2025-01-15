import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { format } from "date-fns";
import Link from "next/link";

// Utility functions to interact with the API
const fetchOrders = async () => {
  try {
    const res = await fetch(`/api/admin/orders`); // Fetch all orders for admin
    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }
    const data = await res.json();
    return data.orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`/api/admin/orders`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: orderId, status }),
    });
    const data = await res.json();
    return data.order;
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

const deleteOrder = async (orderId) => {
  try {
    const res = await fetch(`/api/admin/orders?id=${orderId}`, {
      method: "DELETE",
    });
    return res.status === 200;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (!session || session.user.role !== "admin") {
        router.push("/auth/signin"); // Redirect to login if not authenticated or not admin
        return;
      }

      const orders = await fetchOrders();
      setOrders(orders);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleConfirmOrder = async (orderId) => {
    const updatedOrder = await updateOrderStatus(orderId, "confirmed");
    if (updatedOrder) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "confirmed" } : order
        )
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const success = await deleteOrder(orderId);
    if (success) {
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    } else {
      setError("Failed to delete order");
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (orders.length === 0) {
    return <p>No orders to manage.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Manage Orders</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Order ID</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Total Amount</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-2 border-b">{order.id}</td>
                <td className="px-4 py-2 border-b">
                  {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                </td>
                <td className="px-4 py-2 border-b">${order.totalAmount}</td>
                <td className="px-4 py-2 border-b">
                  <span
                    className={`${
                      order.status === "confirmed"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  {order.status !== "confirmed" && (
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="text-green-500 hover:underline mr-2"
                    >
                      Confirm Order
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import Link from "next/link";

// Utility functions to interact with the API
const fetchOrders = async (id) => {
  try {
    const res = await fetch(`/api/orders?id=${id}`);
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

// Function to decode the JWT token and get userId
const getUserIdFromToken = () => {
  const token = localStorage.getItem("user"); // Assuming you store the JWT in localStorage under "jwt"
  if (!token) return null;

  try {
    const decoded = JSON.parse(token); // Decode JWT payload (base64)
    return decoded.id; // Assuming the userId is in the payload
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserIdFromToken(); // Get userId from JWT
      if (!userId) {
        router.push("/login"); // Redirect to login if no userId found in JWT
        return;
      }

      const orders = await fetchOrders(userId);
      setOrders(orders);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (orders.length === 0) {
    return <p>You haven't placed any orders yet.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Your Orders</h1>
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
                  <Link
                    href={`/orders/${order.id}`}
                    passHref
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
  );
};

export default Orders;

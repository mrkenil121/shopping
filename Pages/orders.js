import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react"; // Assuming you're using next-auth for authentication
import { format } from "date-fns"; // To format the date of the orders
import Link from "next/link";

// Utility functions to interact with the API
const fetchOrders = async (userId) => {
  try {
    const res = await fetch(`/api/orders?userId=${userId}`);
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/auth/signin"); // Redirect to login if not authenticated
        return;
      }

      const userId = session.user.id; // Assuming you have the user id in session
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

'use client'

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        if (!data.orders || !Array.isArray(data.orders)) {
          throw new Error("Invalid orders data received");
        }
        setOrders(data.orders); // Assuming the API returns an object with an "orders" field
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Render loading, error, or orders
  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p className="text-red-600">Failed to load orders. Please try again later.</p>;
  }

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Orders List</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <div className="overflow-x-auto">
          {/* Orders Table */}
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Order ID</th>
                <th className="px-4 py-2 border-b">Customer</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Total</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="px-6 py-3 border-b">{order.id}</td>
                  <td className="px-6 py-3 border-b">{order.customer.name}</td>
                  <td className="px-6 py-3 border-b">{order.status}</td>
                  <td className="px-6 py-3 border-b">${order.total}</td>
                  <td className="px-6 py-3 border-b">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
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

export default OrderList;

'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/compat/router"; // Import useRouter from next/router
import { useAuth } from "../auth/AuthProvider"; // Assuming you have an AuthProvider for managing user state

const OrderDetails = () => {
  const { user } = useAuth(); // Get current user details (ensure admin authentication)
  const router = useRouter(); // Directly use useRouter here
  const [isMounted, setIsMounted] = useState(false); // State to track component mount

  // Check if router is available and if query parameters exist
  const orderId = router?.query.orderId; // Get the order ID from URL params (using query params in Next.js)

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true when the component is mounted
  }, []);

  // Prevent rendering if component is not yet mounted or orderId is not available
  if (!isMounted || !orderId) {
    return <p>Loading...</p>;
  }

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Pending"); // Default order status

  // Fetch order details from the server
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data);
        setStatus(data.status); // Set the status from fetched order
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Handle updating the order status
  const handleUpdateStatus = async () => {
    // Ensure status is actually changed before making the request
    if (order.status === status) {
      alert("Status is already set to this value.");
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder); // Update the local state with new data
      alert("Order status updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle navigation back to the order list
  const handleGoBack = () => {
    router.push("/admin/orders"); // Using Next.js router.push to navigate
  };

  // Loading and error handling
  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Order Details</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {/* Order Info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Order ID: {order.id}</h2>
          <p className="text-gray-600">Customer: {order.customer.name}</p>
          <p className="text-gray-600">Email: {order.customer.email}</p>
          <p className="text-gray-600">Phone: {order.customer.phone}</p>
        </div>

        {/* Items List */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Items</h3>
          <ul>
            {order.items.map((item) => (
              <li key={item.id} className="mb-2">
                <span className="font-semibold">{item.name}</span>: {item.quantity} x ${item.price}
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Shipping Information</h3>
          <p className="text-gray-600">Address: {order.shippingAddress}</p>
          <p className="text-gray-600">City: {order.shippingCity}</p>
          <p className="text-gray-600">Postal Code: {order.shippingPostalCode}</p>
        </div>

        {/* Status Update */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Update Order Status</h3>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Status
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && <p className="text-red-600">{error}</p>}

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleGoBack}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

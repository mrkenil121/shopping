import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCartItems } from "@/utils/cartUtils"; // Import cart utility function
import "../app/globals.css";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
  });

  const router = useRouter();

  useEffect(() => {
    // Fetch cart items from localStorage
    const fetchCartItems = () => {
      const items = getCartItems();
      setCartItems(items);
      setLoading(false);
    };

    fetchCartItems();
  }, []);

  const handleChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Validate shipping details
    if (!shippingDetails.name || !shippingDetails.address || !shippingDetails.city || !shippingDetails.zip) {
      alert("Please fill in all shipping details.");
      return;
    }
    // Proceed to payment page (you can replace this with actual logic later)
    alert("Proceeding to payment...");
    router.push("/payment"); // Redirect to payment page (you'll need to create this page)
  };

  if (loading) {
    return <p>Loading cart...</p>;
  }

  if (cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Checkout</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={shippingDetails.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={shippingDetails.address}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={shippingDetails.city}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={shippingDetails.zip}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border-b">Product</th>
                <th className="px-4 py-2 text-left border-b">Price</th>
                <th className="px-4 py-2 text-left border-b">Quantity</th>
                <th className="px-4 py-2 text-left border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.productId}>
                  <td className="px-4 py-2 border-b">{item.productName}</td>
                  <td className="px-4 py-2 border-b">${item.price}</td>
                  <td className="px-4 py-2 border-b">{item.quantity}</td>
                  <td className="px-4 py-2 border-b">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between">
            <span className="font-semibold text-xl">Total: ${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCartItems, removeFromCart, updateCartItemQuantity } from "@/utils/cartUtils"; // Custom utilities for cart logic

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = () => {
      const items = getCartItems(); // Fetch cart items from localStorage or API
      setCartItems(items);
      setLoading(false);
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = (productId) => {
    removeFromCart(productId); // Custom function to remove item from cart
    setCartItems(getCartItems());
  };

  const handleUpdateQuantity = (productId, quantity) => {
    updateCartItemQuantity(productId, quantity); // Custom function to update cart item quantity
    setCartItems(getCartItems());
  };

  const handleCheckout = () => {
    router.push("/checkout"); // Redirect to checkout page
  };

  if (loading) {
    return <p>Loading cart...</p>;
  }

  if (cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Shopping Cart</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Product</th>
              <th className="px-4 py-2 border-b">Price</th>
              <th className="px-4 py-2 border-b">Quantity</th>
              <th className="px-4 py-2 border-b">Total</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.productId}>
                <td className="px-4 py-2 border-b">{item.productName}</td>
                <td className="px-4 py-2 border-b">${item.price}</td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(item.productId, e.target.value)
                    }
                    className="w-16 p-2 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right">
          <button
            onClick={handleCheckout}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

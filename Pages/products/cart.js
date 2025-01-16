import React, { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [token, setToken] = useState(null);

  // Set the token from localStorage once on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("user"); // Fetch JWT token from local storage
    if (!storedToken) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    setToken(storedToken);
  }, []);

  // Fetch cart items once the token is available
  useEffect(() => {
    if (token) {
      const fetchCartItems = async () => {
        try {
          const response = await axios.get("/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCartItems(response.data.cartItems);
          setTotalPrice(response.data.totalPrice);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch cart items");
          setLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [token]); // Run this effect whenever the token is available

  // Handle cart item quantity update
  const handleQuantityChange = async (cartItemId, quantity) => {
    if (quantity < 1) return;

    try {
      const response = await axios.put(
        `/api/cart/${cartItemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems(response.data.cartItems);
      setTotalPrice(response.data.totalPrice);
    } catch (err) {
      setError("Failed to update quantity");
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    try {
      await axios.post(
        "/api/checkout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Checkout successful");
      setCartItems([]); // Clear cart items after successful checkout
      setTotalPrice(0);
    } catch (err) {
      setError("Checkout failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <p><strong>{item.product.name}</strong></p>
              <p>Price: ${item.price}</p>
              <div>
                <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                />
              </div>
              <p>Subtotal: ${item.quantity * item.price}</p>
            </div>
          ))}
          <h2>Total: ${totalPrice}</h2>
          <button onClick={handleCheckout} className="checkout-button">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;

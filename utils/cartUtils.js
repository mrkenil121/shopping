// utils/cartUtils.js

/**
 * Utility functions to manage shopping cart operations
 */

const CART_KEY = "shopping_cart";

/**
 * Get cart items from localStorage.
 * @returns {Array} Array of cart items.
 */
export const getCartItems = () => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

/**
 * Save cart items to localStorage.
 * @param {Array} cartItems - Array of cart items to be saved.
 */
const saveCartItems = (cartItems) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }
};

/**
 * Add an item to the cart.
 * @param {Object} item - The item to add (should contain productId, productName, price, and quantity).
 */
export const addToCart = (item) => {
  const cart = getCartItems();
  const existingItemIndex = cart.findIndex((cartItem) => cartItem.productId === item.productId);

  if (existingItemIndex > -1) {
    // If the item already exists, update its quantity
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    // If the item doesn't exist, add it to the cart
    cart.push(item);
  }

  saveCartItems(cart);
};

/**
 * Remove an item from the cart.
 * @param {string} productId - The ID of the product to remove.
 */
export const removeFromCart = (productId) => {
  const cart = getCartItems();
  const updatedCart = cart.filter((item) => item.productId !== productId);

  saveCartItems(updatedCart);
};

/**
 * Update the quantity of an item in the cart.
 * @param {string} productId - The ID of the product to update.
 * @param {number} quantity - The new quantity for the product.
 */
export const updateCartItemQuantity = (productId, quantity) => {
  const cart = getCartItems();
  const updatedCart = cart.map((item) => {
    if (item.productId === productId) {
      return {
        ...item,
        quantity: Number(quantity),
      };
    }
    return item;
  });

  saveCartItems(updatedCart);
};

/**
 * Clear all items from the cart.
 */
export const clearCart = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_KEY);
  }
};

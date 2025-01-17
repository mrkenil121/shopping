import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import "@/app/globals.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [cartItems, setCartItems] = useState({});  // Store cart quantities by productId
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products/filter?category=" + category);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items to get current quantities
  const fetchCartItems = async () => {
    const token = localStorage.getItem("user");
    if (!token) {
      setCartLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create a map of productId to quantity
      const cartMap = {};
      response.data.cartItems.forEach(item => {
        cartMap[item.productId] = item.quantity;
      });
      setCartItems(cartMap);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, [category]);

  // Add to cart function
  const addToCart = async (product) => {
    const token = localStorage.getItem("user");
    
    if (!token) {
      router.push(`/login?redirect=/products`);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    setError(null);

    try {
      await axios.post(
        "/api/cart",
        {
          productId: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update cart items after adding
      await fetchCartItems();
      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.response?.data?.message || "Failed to add item to cart");
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Update quantity function
  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("user");
    
    if (!token) {
      router.push(`/login?redirect=/products`);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      await axios.post(
        "/api/cart",
        {
          productId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update cart items after quantity change
      await fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAddToCartButton = (product) => {
    const quantity = cartItems[product.id];
    const isLoading = addingToCart[product.id];

    if (isLoading) {
      return (
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded w-full opacity-75 cursor-not-allowed"
          disabled
        >
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            {quantity ? 'Updating...' : 'Adding...'}
          </span>
        </button>
      );
    }

    if (quantity) {
      return (
        <div className="mt-2 flex items-center justify-between w-full border rounded">
          <button
            className="px-4 py-2 text-blue-600 hover:bg-blue-50"
            onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))}
          >
            -
          </button>
          <span className="text-gray-700">{quantity} in cart</span>
          <button
            className="px-4 py-2 text-blue-600 hover:bg-blue-50"
            onClick={() => updateQuantity(product.id, quantity + 1)}
          >
            +
          </button>
        </div>
      );
    }

    return (
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded w-full hover:bg-blue-700"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Product Listings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filter Options */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded mb-4 md:mb-0"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="books">Books</option>
          <option value="home-appliances">Home Appliances</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading || cartLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded p-4 flex flex-col items-center"
            >
              <Link href={`/products/${product.id}`} className="w-full">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4">
                    No Image
                  </div>
                )}
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">${product.salesPrice.toFixed(2)}</p>
              </Link>
              {renderAddToCartButton(product)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No products found for the selected category or search query.
        </p>
      )}
    </div>
  );
};

export default ProductsPage;
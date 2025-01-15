import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { addToCart } from "@/utils/cartUtils";

const ProductsPage = () => {
  const [products, setProducts] = useState([]); // State for products
  const [loading, setLoading] = useState(true); // State for loading
  const [category, setCategory] = useState(""); // State for filtering category
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products/filter?category=" + category);
      setProducts(response.data.products); // Set products to state
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch products on category change
  useEffect(() => {
    fetchProducts();
  }, [category]);

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Product Listings</h1>

      {/* Search and Filter Options */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded mb-4 md:mb-0"
        />

        {/* Category Filter */}
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
      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded p-4 flex flex-col items-center"
            >
              <Link href={`/products/${product.id}`}> 
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4"
                  />
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-600">${product.price}</p>
              </Link>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found for the selected category or search query.</p>
      )}
    </div>
  );
};

export default ProductsPage;
